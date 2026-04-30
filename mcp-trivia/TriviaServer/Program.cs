using TriviaServer.State;
using TriviaServer.Tools;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddSingleton<GameState>();

builder.Services
    .AddMcpServer()
    .WithHttpTransport()
    .WithTools<TriviaTools>();

var app = builder.Build();

app.MapMcp();

Console.WriteLine("MCP Trivia Server starting on http://localhost:5200");
app.Run("http://localhost:5200");
