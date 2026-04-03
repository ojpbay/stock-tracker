# stock-tracker Development Guidelines

Auto-generated from all feature plans. Last updated: 2026-03-31

## Active Technologies
- Azure Cosmos DB NoSQL — two containers: `watchlists` (partition key: `/id`) and `transactions` (partition key: `/watchlistId`); emulated locally via Docker (001-stock-tracker-app)

- **API**: C# / .NET 10, ASP.NET Core Web API (controllers), MediatR, FluentValidation
- **Client**: TypeScript / Angular 21 (standalone components), Angular Material v3, ng2-charts + Chart.js, `@ngrx/signals` v21 (Signal Store) + `@ngrx/signals/entities`
- **Database**: Azure Cosmos DB NoSQL — containers: `watchlists` (partition key: `/id`), `transactions` (partition key: `/watchlistId`); Docker emulator locally
- **Stock Data**: Finnhub API (60 req/min free tier)
- **API Tests**: xUnit, Moq, WebApplicationFactory + Cosmos Emulator
- **Client Tests**: Jest, jest-preset-angular, Angular TestBed (stores tested via `TestBed.inject`)

## Project Structure

```text
api/
  src/StockTracker.Api/
    Features/        # Vertical slice — one folder per operation
    Domain/          # Entities: Watchlist, Holding, Transaction
    Infrastructure/  # Cosmos repositories, Finnhub HTTP client
  tests/
    StockTracker.UnitTests/
    StockTracker.IntegrationTests/

client/
  src/app/
    core/            # Interceptors, app-wide services
    shared/          # Reusable components (pnl-indicator, price-badge)
    features/        # stocks, watchlists, holdings, transactions, dashboard
```

## Commands

```bash
# Start Cosmos emulator
docker run -d --name cosmos-emulator -p 8081:8081 mcr.microsoft.com/cosmosdb/linux/azure-cosmos-emulator:latest

# Run API
cd api/src/StockTracker.Api && dotnet run

# Run Angular client
cd client && npm install && ng serve

# API tests
cd api && dotnet test

# Angular tests
cd client && npm test
```

## Code Style

- API: Vertical Slice — keep query/command/handler/controller in the same feature folder
- Angular: Standalone components only; use NgRx Signal Store (`signalStore()`) for all feature state; use `@if`/`@for` control flow syntax
- No NgModules; no classic NgRx (actions/reducers/effects); no class-based route guards
- Each feature has its own `store/` subfolder with a `*.store.ts` and `*.store.spec.ts`
- Use `withEntities<T>()` from `@ngrx/signals/entities` for collection state (holdings, transactions)
- `DashboardStore` is root (`providedIn: 'root'`); all other stores are feature-scoped
- Transactions are immutable — no update or delete in v1

## Recent Changes
- 001-stock-tracker-app: Added Azure Cosmos DB NoSQL — two containers: `watchlists` (partition key: `/id`) and `transactions` (partition key: `/watchlistId`); emulated locally via Docker

- 2026-03-27: Initial plan created for feature 001-stock-tracker-app

<!-- MANUAL ADDITIONS START -->
<!-- MANUAL ADDITIONS END -->
