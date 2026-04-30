# MCP Trivia Game — Learning Demo

A working example of the full MCP (Model Context Protocol) stack:

```
Angular Chat UI  ──HTTP──▶  TriviaApp (ASP.NET Core)
                                 │
                                 ├── MCP Client ──▶ TriviaServer (ASP.NET Core MCP Server)
                                 │                       • 6 game tools
                                 │                       • In-memory game state
                                 └── Anthropic API (Claude, tool-use loop)
```

## What You'll Learn

| Concept | Where |
|---|---|
| MCP tool registration | `TriviaServer/Tools/TriviaTools.cs` |
| In-memory server state | `TriviaServer/State/GameState.cs` |
| MCP server setup (HTTP transport) | `TriviaServer/Program.cs` |
| MCP client (singleton connection) | `TriviaApp/Services/McpClientService.cs` |
| Claude tool-use loop (the MCP host pattern) | `TriviaApp/Services/ClaudeService.cs` |
| Angular chat UI with NgRx Signal Store | `../client/src/app/features/trivia/` |

## Prerequisites

- .NET 10 SDK
- Node.js 22+
- An Anthropic API key

## Running

**Terminal 1 — MCP Trivia Server (port 5200)**
```bash
cd TriviaServer
dotnet run
```

**Terminal 2 — MCP App Backend (port 5201)**
```bash
export ANTHROPIC_API_KEY=sk-ant-...
cd TriviaApp
dotnet run
```

**Terminal 3 — Angular Client (port 4200)**
```bash
cd ../client
ng serve
```

Open `http://localhost:4200/trivia` and click "Trivia Game" in the sidebar.

## The MCP Tool-Use Loop

The key pattern is in `TriviaApp/Services/ClaudeService.cs`:

```
1. Send user message + MCP tool definitions → Claude
2. Claude responds with stop_reason="tool_use"
3. Execute the tool on TriviaServer via MCP protocol
4. Send tool result back to Claude as a "user" message
5. Repeat until stop_reason="end_turn"
6. Return Claude's final text response
```

The tool-call badges in the chat UI (⚙ `get_question(category: Science)`) make this loop visible.

## MCP Tools

| Tool | Description | Points |
|---|---|---|
| `get_categories` | Lists available categories | — |
| `get_question` | Fetches a question (no answer exposed) | — |
| `check_answer` | Validates answer, updates score | +10/20/30 |
| `get_hint` | Returns a clue | −5 off next answer |
| `get_score` | Returns current stats | — |
| `reset_game` | Resets all state | — |
