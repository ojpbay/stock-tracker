using ModelContextProtocol.Client;
using ModelContextProtocol.Protocol.Transport;
using ModelContextProtocol.Protocol.Types;
using System.Text.Json;

namespace TriviaApp.Services;

/// <summary>
/// Singleton wrapper around the MCP client connection to TriviaServer.
///
/// Why singleton? The MCP client opens an SSE connection to the server.
/// Creating a new client per request would flood the server with connections.
/// One shared client handles all concurrent requests.
/// </summary>
public sealed class McpClientService : IAsyncDisposable
{
    private IMcpClient? _client;
    private readonly SemaphoreSlim _lock = new(1, 1);
    private const string McpServerUrl = "http://localhost:5200/mcp";

    public async Task<IMcpClient> GetClientAsync()
    {
        if (_client is not null) return _client;

        await _lock.WaitAsync();
        try
        {
            if (_client is not null) return _client;

            _client = await McpClientFactory.CreateAsync(
                new SseClientTransport(new SseClientTransportOptions
                {
                    Endpoint = new Uri(McpServerUrl),
                }),
                new McpClientOptions
                {
                    ClientInfo = new Implementation { Name = "trivia-app", Version = "1.0.0" },
                });

            Console.WriteLine($"MCP client connected to {McpServerUrl}");
            return _client;
        }
        finally
        {
            _lock.Release();
        }
    }

    /// <summary>
    /// Calls a tool on the MCP server and deserializes the text response as T.
    /// </summary>
    public async Task<T> CallToolAsync<T>(string toolName, Dictionary<string, object?>? args = null)
    {
        var client = await GetClientAsync();
        var result = await client.CallToolAsync(toolName, args ?? []);

        var text = result.Content
            .FirstOrDefault(c => c.Type == "text")
            ?.Text ?? "{}";

        return JsonSerializer.Deserialize<T>(text,
            new JsonSerializerOptions { PropertyNameCaseInsensitive = true })!;
    }

    /// <summary>
    /// Returns the MCP server's tool list as raw JSON-schema Tool objects,
    /// ready to be forwarded to the Anthropic Messages API.
    /// </summary>
    public async Task<IList<Tool>> ListToolsAsync()
    {
        var client = await GetClientAsync();
        var result = await client.ListToolsAsync();
        return [.. result];
    }

    public async ValueTask DisposeAsync()
    {
        if (_client is IAsyncDisposable d) await d.DisposeAsync();
    }
}
