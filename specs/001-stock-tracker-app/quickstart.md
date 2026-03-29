# Quickstart: Stock Tracker Application

**Date**: 2026-03-27
**Branch**: `001-stock-tracker-app`

---

## Prerequisites

| Tool | Version | Purpose |
|------|---------|---------|
| .NET SDK | 10.0+ | API project |
| Node.js | 22 LTS+ | Angular CLI |
| Angular CLI | 21+ | `npm install -g @angular/cli` |
| Docker Desktop | Latest | Cosmos DB Emulator |
| Git | Any | Version control |

---

## Repository Structure

```
stock-tracker/
├── api/                              # .NET 10 Web API
│   ├── src/
│   │   └── StockTracker.Api/
│   │       ├── Features/
│   │       │   ├── Stocks/           # Search & quote proxy
│   │       │   ├── Watchlists/       # Watchlist CRUD
│   │       │   ├── Holdings/         # Add stock to watchlist
│   │       │   ├── Transactions/     # Buy / Sell / Dividend
│   │       │   └── Dashboard/        # Aggregated P&L view
│   │       ├── Domain/               # Domain entities & value objects
│   │       ├── Infrastructure/
│   │       │   ├── Cosmos/           # CosmosClient, repositories
│   │       │   └── StockData/        # Finnhub HTTP client
│   │       ├── appsettings.json
│   │       ├── appsettings.Development.json  # gitignored — contains API keys
│   │       └── Program.cs
│   └── tests/
│       ├── StockTracker.UnitTests/
│       └── StockTracker.IntegrationTests/
│
├── client/                           # Angular 21 SPA
│   ├── src/
│   │   └── app/
│   │       ├── core/
│   │       │   ├── interceptors/     # HTTP error / loading interceptors
│   │       │   └── services/         # App-wide singletons
│   │       ├── shared/
│   │       │   ├── components/       # Reusable UI (price-badge, p&l-indicator, etc.)
│   │       │   └── pipes/
│   │       └── features/
│   │           ├── stocks/
│   │           │   ├── store/        # stocks.store.ts (NgRx Signal Store)
│   │           │   └── services/     # stocks.service.ts (HTTP)
│   │           ├── watchlists/
│   │           │   ├── store/        # watchlists.store.ts
│   │           │   └── services/
│   │           ├── holdings/
│   │           │   ├── store/        # holdings.store.ts (withEntities)
│   │           │   └── services/
│   │           ├── transactions/
│   │           │   ├── store/        # transactions.store.ts (withEntities)
│   │           │   └── services/
│   │           └── dashboard/
│   │               ├── store/        # dashboard.store.ts (root, aggregates all)
│   │               └── components/   # P&L chart (Chart.js via ng2-charts)
│   ├── angular.json
│   └── package.json
│
└── specs/
    └── 001-stock-tracker-app/        # Design artifacts (this directory)
```

---

## 1. Start the Cosmos DB Emulator

```bash
docker run -d \
  --name cosmos-emulator \
  -p 8081:8081 \
  -p 10250-10255:10250-10255 \
  -e AZURE_COSMOS_EMULATOR_PARTITION_COUNT=5 \
  -e AZURE_COSMOS_EMULATOR_ENABLE_DATA_PERSISTENCE=false \
  mcr.microsoft.com/cosmosdb/linux/azure-cosmos-emulator:latest
```

Wait ~30 seconds for the emulator to initialise, then verify it's running:

```bash
curl -k https://localhost:8081/_explorer/index.html
# Should return the Cosmos Data Explorer HTML
```

**Default emulator credentials** (fixed, not secret):
- Endpoint: `https://localhost:8081`
- Account Key: `C2y6yDjf5/R+ob0N8A7Cgv30VRDJIWEHLM+4QDU5DE2nQ9nDuVTqobD4b8mGGyPD8xiIZx0ow==`

---

## 2. Configure the API

Create `api/src/StockTracker.Api/appsettings.Development.json` (gitignored):

```json
{
  "CosmosDb": {
    "ConnectionString": "AccountEndpoint=https://localhost:8081/;AccountKey=C2y6yDjf5/R+ob0N8A7Cgv30VRDJIWEHLM+4QDU5DE2nQ9nDuVTqobD4b8mGGyPD8xiIZx0ow==;",
    "DatabaseName": "StockTrackerDb",
    "WatchlistsContainerName": "watchlists",
    "TransactionsContainerName": "transactions"
  },
  "Finnhub": {
    "ApiKey": "<your-finnhub-api-key>",
    "BaseUrl": "https://finnhub.io/api/v1/"
  },
  "Cors": {
    "AllowedOrigins": ["http://localhost:4200"]
  }
}
```

Get a free Finnhub API key at `https://finnhub.io` (register — no credit card required).

---

## 3. Run the API

```bash
cd api/src/StockTracker.Api
dotnet run
```

The API starts at `http://localhost:5000`.

On first startup, the application creates the Cosmos DB database and containers automatically (`CreateDatabaseIfNotExistsAsync`).

Verify the API is running:
```bash
curl http://localhost:5000/health
# {"status":"Healthy"}
```

OpenAPI documentation is available at: `http://localhost:5000/swagger`

---

## 4. Run the Angular Client

```bash
cd client
npm install         # installs @ngrx/signals, @angular/material, ng2-charts, chart.js, etc.
ng serve
```

The client starts at `http://localhost:4200`.

The Angular dev server proxies `/api/**` requests to `http://localhost:5000/api` via `proxy.conf.json` (no CORS issues during development).

---

## 5. Run Tests

### .NET Tests

```bash
# Unit tests only
cd api/tests/StockTracker.UnitTests
dotnet test

# Integration tests (requires Cosmos emulator running)
cd api/tests/StockTracker.IntegrationTests
dotnet test

# All tests with coverage
cd api
dotnet test --collect:"XPlat Code Coverage"
```

### Angular Tests

```bash
cd client

# Unit tests (Jest — watch mode; includes signal store tests)
npm test

# Unit tests (CI — single run with coverage)
npm run test:ci

# Lint
ng lint
```

**Signal store test pattern** — stores are tested via `TestBed.inject()`:
```typescript
store = TestBed.inject(WatchlistsStore);
expect(store.watchlists()).toEqual([]);
await store.loadWatchlists();
expect(store.loading()).toBe(false);
```

---

## 6. Key Configuration Reference

### API `appsettings.json` (committed — no secrets)

```json
{
  "Logging": {
    "LogLevel": {
      "Default": "Information",
      "Microsoft.AspNetCore": "Warning"
    }
  },
  "CosmosDb": {
    "DatabaseName": "StockTrackerDb",
    "WatchlistsContainerName": "watchlists",
    "TransactionsContainerName": "transactions"
  },
  "Finnhub": {
    "BaseUrl": "https://finnhub.io/api/v1/"
  }
}
```

### Angular Environment (`environment.ts`)

```typescript
export const environment = {
  production: false,
  apiBaseUrl: '/api'
};
```

---

## 7. Development Workflow

1. Make changes to API or client
2. API hot-reloads automatically with `dotnet watch run`
3. Angular live-reloads automatically with `ng serve`
4. Write tests before or alongside implementation
5. Run the full test suite before committing

---

## 8. Common Issues

| Issue | Resolution |
|-------|-----------|
| Cosmos emulator certificate error | The `appsettings.Development.json` disables SSL validation for localhost; do not use this in production |
| Finnhub 401 Unauthorized | Check API key is set in `appsettings.Development.json` |
| Angular proxy not working | Ensure `proxy.conf.json` is referenced in `angular.json` under `serve.options.proxyConfig` |
| Port 8081 already in use | Stop any existing Cosmos emulator: `docker stop cosmos-emulator` |
| `ng: command not found` | Install Angular CLI globally: `npm install -g @angular/cli@21` |
