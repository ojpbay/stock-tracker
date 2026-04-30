using System.Net.Http.Headers;
using System.Text;
using System.Text.Json;
using System.Text.Json.Nodes;

namespace TriviaApp.Services;

public record SimpleMessage(string Role, string Content);
public record ToolCallSummary(string ToolName, string Args);
public record ChatResult(string Response, List<ToolCallSummary> ToolCalls);

/// <summary>
/// Drives a Claude conversation that uses MCP tools.
///
/// This class is the heart of an MCP host application. It implements the
/// tool-use loop — the back-and-forth between Claude and the MCP server:
///
///   1. Send conversation + tool definitions to Claude.
///   2. Claude responds with stop_reason="tool_use" if it wants to call a tool.
///   3. We execute that tool via the MCP client (TriviaServer).
///   4. Feed the tool result back to Claude as a "user" message.
///   5. Repeat until Claude returns stop_reason="end_turn" with its final text.
///
/// We call the Anthropic API directly via HttpClient so the JSON request/response
/// structure is fully visible — no SDK magic. This makes the MCP mechanism easy to study.
/// </summary>
public class ClaudeService(McpClientService mcpClient, IConfiguration config, IHttpClientFactory httpFactory)
{
    private readonly string _apiKey = config["ANTHROPIC_API_KEY"]
        ?? throw new InvalidOperationException(
            "ANTHROPIC_API_KEY is required. Run: export ANTHROPIC_API_KEY=sk-ant-...");

    private static readonly JsonSerializerOptions JsonOpts =
        new() { PropertyNamingPolicy = JsonNamingPolicy.SnakeCaseLower };

    private const string Model = "claude-sonnet-4-6";
    private const string ApiUrl = "https://api.anthropic.com/v1/messages";

    private const string SystemPrompt = """
        You are QUIZZY, an enthusiastic and encouraging trivia game host.
        Available categories: Science, History, Geography, Pop Culture.

        Game rules:
        - On first contact, greet the player and call get_categories to show options.
        - Use get_question to fetch a question (pass category/difficulty when the player specifies).
        - After the player answers, ALWAYS call check_answer with the exact questionId and their answer.
        - Offer get_hint if they ask — warn them it costs 5 points off their next correct answer.
        - Call get_score when they want to see their stats.
        - Call reset_game when they want to start over.
        Keep responses concise, energetic, and fun.
        """;

    public async Task<ChatResult> ChatAsync(string message, IEnumerable<SimpleMessage> history)
    {
        // Step 1: Fetch tool definitions from the MCP server.
        // This is the key MCP concept — the host discovers tools at runtime.
        var mcpTools = await mcpClient.ListToolsAsync();

        // Convert MCP tool definitions to the JSON format Anthropic expects.
        // MCP tool.InputSchema is already a JSON Schema object — we just repackage it.
        var anthropicTools = mcpTools.Select(t => new JsonObject
        {
            ["name"] = t.Name,
            ["description"] = t.Description ?? string.Empty,
            ["input_schema"] = JsonNode.Parse(t.InputSchema.GetRawText()),
        }).ToArray();

        // Build the Anthropic message array from conversation history + new user message
        var messages = new JsonArray();
        foreach (var m in history)
            messages.Add(new JsonObject { ["role"] = m.Role, ["content"] = m.Content });
        messages.Add(new JsonObject { ["role"] = "user", ["content"] = message });

        var toolCalls = new List<ToolCallSummary>();

        // Step 2: The tool-use loop
        while (true)
        {
            var requestBody = new JsonObject
            {
                ["model"] = Model,
                ["max_tokens"] = 1024,
                ["system"] = SystemPrompt,
                ["tools"] = JsonNode.Parse(JsonSerializer.Serialize(anthropicTools)),
                ["messages"] = JsonNode.Parse(messages.ToJsonString()),
            };

            var responseJson = await PostToAnthropicAsync(requestBody.ToJsonString());
            var response = JsonNode.Parse(responseJson)!;
            var stopReason = response["stop_reason"]?.GetValue<string>();
            var content = response["content"]?.AsArray() ?? [];

            if (stopReason == "tool_use")
            {
                // Step 3: Claude wants to call tools — add its response to the history
                messages.Add(new JsonObject
                {
                    ["role"] = "assistant",
                    ["content"] = JsonNode.Parse(content.ToJsonString()),
                });

                // Step 4: Execute each requested tool via the MCP client
                var toolResultContents = new JsonArray();
                foreach (var block in content)
                {
                    if (block?["type"]?.GetValue<string>() != "tool_use") continue;

                    var toolName = block["name"]!.GetValue<string>();
                    var toolUseId = block["id"]!.GetValue<string>();
                    var inputNode = block["input"];

                    // Parse tool arguments from Claude's request
                    var args = inputNode is JsonObject inputObj
                        ? inputObj.ToDictionary(
                            kvp => kvp.Key,
                            kvp => (object?)(kvp.Value?.ToString()))
                        : new Dictionary<string, object?>();

                    string resultJson;
                    try
                    {
                        // *** This is where the MCP call happens ***
                        // We call the tool on TriviaServer via the MCP protocol
                        var client = await mcpClient.GetClientAsync();
                        var toolResult = await client.CallToolAsync(toolName, args);
                        resultJson = toolResult.Content
                            .FirstOrDefault(c => c.Type == "text")?.Text ?? "{}";
                    }
                    catch (Exception ex)
                    {
                        resultJson = JsonSerializer.Serialize(new { error = ex.Message });
                    }

                    toolCalls.Add(new ToolCallSummary(toolName, inputNode?.ToJsonString() ?? "{}"));

                    // Package the result in Anthropic's tool_result format
                    toolResultContents.Add(new JsonObject
                    {
                        ["type"] = "tool_result",
                        ["tool_use_id"] = toolUseId,
                        ["content"] = resultJson,
                    });
                }

                // Step 5: Feed tool results back to Claude as a new user turn and loop again
                messages.Add(new JsonObject
                {
                    ["role"] = "user",
                    ["content"] = JsonNode.Parse(toolResultContents.ToJsonString()),
                });
            }
            else
            {
                // stop_reason == "end_turn" — Claude is done; extract the text response
                var text = content
                    .FirstOrDefault(b => b?["type"]?.GetValue<string>() == "text")
                    ?["text"]?.GetValue<string>() ?? string.Empty;

                return new ChatResult(text, toolCalls);
            }
        }
    }

    private async Task<string> PostToAnthropicAsync(string jsonBody)
    {
        using var http = httpFactory.CreateClient();
        using var request = new HttpRequestMessage(HttpMethod.Post, ApiUrl);
        request.Headers.Add("x-api-key", _apiKey);
        request.Headers.Add("anthropic-version", "2023-06-01");
        request.Content = new StringContent(jsonBody, Encoding.UTF8, "application/json");

        using var response = await http.SendAsync(request);
        var body = await response.Content.ReadAsStringAsync();
        response.EnsureSuccessStatusCode();
        return body;
    }
}
