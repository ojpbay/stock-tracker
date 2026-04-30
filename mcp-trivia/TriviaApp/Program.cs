using System.Text.Json;
using TriviaApp.Services;

var builder = WebApplication.CreateBuilder(args);

// Services
builder.Services.AddSingleton<McpClientService>();
builder.Services.AddSingleton<ClaudeService>();
builder.Services.AddHttpClient();

builder.Services.AddCors(options =>
    options.AddDefaultPolicy(policy =>
        policy.WithOrigins("http://localhost:4200")
              .AllowAnyMethod()
              .AllowAnyHeader()));

var app = builder.Build();
app.UseCors();

// POST /api/chat — main endpoint: runs the Claude + MCP tool-use loop
app.MapPost("/api/chat", async (ChatRequest req, ClaudeService claude) =>
{
    if (string.IsNullOrWhiteSpace(req.Message))
        return Results.BadRequest(new { error = "message is required" });

    var result = await claude.ChatAsync(req.Message, req.ConversationHistory ?? []);
    return Results.Ok(result);
});

// GET /api/score — convenience endpoint that calls the MCP server's get_score tool directly
app.MapGet("/api/score", async (McpClientService mcp) =>
{
    var score = await mcp.CallToolAsync<ScoreData>("get_score");
    return Results.Ok(score);
});

// POST /api/reset — resets game state on the MCP server
app.MapPost("/api/reset", async (McpClientService mcp) =>
{
    await mcp.CallToolAsync<JsonElement>("reset_game");
    return Results.Ok();
});

Console.WriteLine("MCP Trivia App starting on http://localhost:5201");
app.Run("http://localhost:5201");

// Request / response records
record ChatRequest(string Message, IEnumerable<SimpleMessage>? ConversationHistory);
record ScoreData(int Score, int QuestionsAnswered, int CorrectAnswers, int Streak);
