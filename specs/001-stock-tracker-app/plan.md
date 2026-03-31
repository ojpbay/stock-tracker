# Implementation Plan: Stock Tracker Application

**Branch**: `001-stock-tracker-app` | **Date**: 2026-03-27 | **Spec**: [spec.md](spec.md)
**Input**: Feature specification from `/specs/001-stock-tracker-app/spec.md`

---

## Summary

Build a full-stack personal stock portfolio tracker consisting of an **Angular 21 SPA** (Angular Material + Chart.js via ng2-charts, **NgRx Signal Store** for state) and a **.NET 10 REST API** backed by **Azure Cosmos DB**. Users can search for stocks via the Finnhub API, organise holdings into named watchlists, record buy/sell/dividend transactions, and view dashboard views with graphical profit-and-loss performance indicators.

---

## Technical Context

**Language/Version (API)**: C# / .NET 10
**Language/Version (Client)**: TypeScript / Angular 21
**Primary Dependencies (API)**: ASP.NET Core Web API (controllers), MediatR (vertical slice CQRS), Microsoft.Azure.Cosmos SDK, FluentValidation, xUnit + Moq (tests), Finnhub HTTP client
**Primary Dependencies (Client)**: Angular 21 (standalone), Angular Material v3, ng2-charts + Chart.js, `@ngrx/signals` v21 + `@ngrx/signals/entities` (Signal Store), Jest + jest-preset-angular (tests)
**Storage**: Azure Cosmos DB NoSQL — two containers: `watchlists` (partition key: `/id`) and `transactions` (partition key: `/watchlistId`); emulated locally via Docker
**Testing**: xUnit + WebApplicationFactory + Cosmos Emulator (API integration), Moq (API unit), Jest + Angular TestBed (client unit/component/store)
**Target Platform**: Web (SPA + REST API); local development on Windows 11
**Project Type**: Web application (Angular SPA + .NET API)
**Performance Goals**: Dashboard loads within 3 seconds; P&L recalculates within 2 seconds of transaction save; stock search returns results within 2 seconds
**Constraints**: Single-user, single-currency per watchlist; Finnhub free tier (60 req/min); immutable transaction ledger
**Scale/Scope**: Personal use — up to 10 watchlists, 30 holdings each, 500 transactions per holding

---

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

The project constitution (`/.specify/memory/constitution.md`) contains only placeholder template text — no project-specific governance principles have been defined. No constitution gates apply. This plan proceeds without governance violations.

**Post-design re-check**: No violations identified. The architecture adheres to standard full-stack patterns. NgRx Signal Store is explicitly requested and appropriate for the 5-feature domain complexity. No unjustified complexity has been introduced.

---

## Project Structure

### Documentation (this feature)

```text
specs/001-stock-tracker-app/
├── plan.md              # This file
├── research.md          # Phase 0 — technology decisions (Decision 2 updated: NgRx Signal Store)
├── data-model.md        # Phase 1 — Cosmos DB schema & entity design
├── quickstart.md        # Phase 1 — developer getting-started guide
├── contracts/
│   └── api.md           # Phase 1 — REST API contract (all endpoints)
└── tasks.md             # Phase 2 output (/speckit.tasks — NOT yet created)
```

### Source Code (repository root)

```text
stock-tracker/
├── api/
│   ├── src/
│   │   └── StockTracker.Api/
│   │       ├── Features/
│   │       │   ├── Stocks/
│   │       │   │   ├── Search/
│   │       │   │   │   ├── SearchStocksQuery.cs
│   │       │   │   │   ├── SearchStocksHandler.cs
│   │       │   │   │   └── SearchStocksController.cs
│   │       │   │   └── GetQuote/
│   │       │   │       ├── GetStockQuoteQuery.cs
│   │       │   │       ├── GetStockQuoteHandler.cs
│   │       │   │       └── StocksController.cs
│   │       │   ├── Watchlists/
│   │       │   │   ├── List/
│   │       │   │   ├── Create/
│   │       │   │   ├── Get/
│   │       │   │   ├── Update/
│   │       │   │   └── Delete/
│   │       │   ├── Holdings/
│   │       │   │   └── AddHolding/
│   │       │   ├── Transactions/
│   │       │   │   ├── AddTransaction/
│   │       │   │   └── ListTransactions/
│   │       │   └── Dashboard/
│   │       │       └── GetDashboard/
│   │       ├── Domain/
│   │       │   ├── Watchlist.cs
│   │       │   ├── HoldingSummary.cs
│   │       │   └── Transaction.cs
│   │       ├── Infrastructure/
│   │       │   ├── Cosmos/
│   │       │   │   ├── CosmosDbInitialiser.cs
│   │       │   │   ├── CosmosDbOptions.cs
│   │       │   │   ├── WatchlistRepository.cs
│   │       │   │   └── TransactionRepository.cs
│   │       │   └── StockData/
│   │       │       ├── FinnhubClient.cs
│   │       │       ├── FinnhubOptions.cs
│   │       │       └── IStockDataService.cs
│   │       ├── appsettings.json
│   │       ├── appsettings.Development.json   # gitignored
│   │       └── Program.cs
│   └── tests/
│       ├── StockTracker.UnitTests/
│       │   ├── Features/
│       │   │   ├── Stocks/
│       │   │   ├── Watchlists/
│       │   │   ├── Holdings/
│       │   │   ├── Transactions/
│       │   │   └── Dashboard/
│       │   └── Domain/
│       └── StockTracker.IntegrationTests/
│           ├── StockTrackerApiFactory.cs      # WebApplicationFactory setup
│           ├── Watchlists/
│           ├── Holdings/
│           ├── Transactions/
│           └── Dashboard/
│
├── client/
│   ├── src/
│   │   ├── app/
│   │   │   ├── core/
│   │   │   │   ├── interceptors/
│   │   │   │   │   ├── error.interceptor.ts
│   │   │   │   │   └── loading.interceptor.ts
│   │   │   │   └── services/
│   │   │   │       └── notification.service.ts
│   │   │   ├── shared/
│   │   │   │   ├── components/
│   │   │   │   │   ├── pnl-indicator/         # Coloured P&L display component
│   │   │   │   │   ├── price-badge/           # Current price with change %
│   │   │   │   │   └── loading-spinner/
│   │   │   │   └── pipes/
│   │   │   │       └── currency-format.pipe.ts
│   │   │   ├── features/
│   │   │   │   ├── stocks/
│   │   │   │   │   ├── store/
│   │   │   │   │   │   ├── stocks.store.ts        # signalStore: search results, selected quote
│   │   │   │   │   │   └── stocks.store.spec.ts
│   │   │   │   │   ├── services/
│   │   │   │   │   │   └── stocks.service.ts      # HTTP calls to /api/stocks
│   │   │   │   │   ├── search/
│   │   │   │   │   │   ├── stock-search.component.ts
│   │   │   │   │   │   └── stock-search.component.spec.ts
│   │   │   │   │   ├── detail/
│   │   │   │   │   │   └── stock-detail.component.ts
│   │   │   │   │   └── stocks.routes.ts
│   │   │   │   ├── watchlists/
│   │   │   │   │   ├── store/
│   │   │   │   │   │   ├── watchlists.store.ts    # signalStore: watchlist list, selected, CRUD
│   │   │   │   │   │   └── watchlists.store.spec.ts
│   │   │   │   │   ├── services/
│   │   │   │   │   │   └── watchlists.service.ts
│   │   │   │   │   ├── list/
│   │   │   │   │   ├── edit/
│   │   │   │   │   └── watchlists.routes.ts
│   │   │   │   ├── holdings/
│   │   │   │   │   ├── store/
│   │   │   │   │   │   ├── holdings.store.ts      # signalStore + withEntities<Holding>()
│   │   │   │   │   │   └── holdings.store.spec.ts
│   │   │   │   │   ├── services/
│   │   │   │   │   │   └── holdings.service.ts
│   │   │   │   │   └── add-holding/
│   │   │   │   ├── transactions/
│   │   │   │   │   ├── store/
│   │   │   │   │   │   ├── transactions.store.ts  # signalStore + withEntities<Transaction>()
│   │   │   │   │   │   └── transactions.store.spec.ts
│   │   │   │   │   ├── services/
│   │   │   │   │   │   └── transactions.service.ts
│   │   │   │   │   ├── add-transaction/
│   │   │   │   │   └── transaction-history/
│   │   │   │   └── dashboard/
│   │   │   │       ├── store/
│   │   │   │       │   ├── dashboard.store.ts     # root signalStore; aggregates from other stores
│   │   │   │       │   └── dashboard.store.spec.ts
│   │   │   │       ├── services/
│   │   │   │       │   └── dashboard.service.ts
│   │   │   │       ├── dashboard.component.ts
│   │   │   │       ├── dashboard.component.spec.ts
│   │   │   │       └── pnl-chart/
│   │   │   │           └── pnl-chart.component.ts  # Chart.js via ng2-charts
│   │   │   ├── app.config.ts
│   │   │   ├── app.ts
│   │   │   └── app.routes.ts
│   │   ├── environments/
│   │   │   ├── environment.ts
│   │   │   └── environment.prod.ts
│   │   └── styles.scss
│   ├── proxy.conf.json               # Dev proxy: /api → localhost:5000
│   ├── jest.config.js
│   ├── setup-jest.ts
│   └── package.json
│
└── specs/
    └── 001-stock-tracker-app/
```

**Structure Decision**: Web application layout (Option 2) — separate `api/` and `client/` directories. The API uses vertical slice architecture within `Features/`. The Angular client uses a feature-based structure where each feature owns its `store/`, `services/`, and `components/` subdirectories. Signal stores are co-located with their feature and tested in sibling `*.store.spec.ts` files.

---

## Complexity Tracking

No constitution violations were identified. No complexity justification required.

---

## Phase 0: Research Findings

All technology decisions are resolved. See [research.md](research.md) for full decision log.

**Key resolved decisions**:

| Area                | Decision                                                                                        |
| ------------------- | ----------------------------------------------------------------------------------------------- |
| Angular state       | **NgRx Signal Store** (`@ngrx/signals` v21) — feature stores + `withEntities()` for collections |
| Angular testing     | Jest + jest-preset-angular; stores tested via TestBed with `patchState`                         |
| Chart integration   | ng2-charts (thin Chart.js wrapper)                                                              |
| .NET architecture   | Vertical Slice + MediatR                                                                        |
| Cosmos driver       | `Microsoft.Azure.Cosmos` SDK directly                                                           |
| Cosmos local dev    | Docker Linux Emulator                                                                           |
| Stock data provider | Finnhub (60 req/min free tier)                                                                  |
| OpenAPI             | Built-in `AddOpenApi()` (.NET 10)                                                               |
| Integration testing | `WebApplicationFactory` + Cosmos Emulator                                                       |

---

## Phase 1: Design Artifacts

### NgRx Signal Store Architecture

Five stores serve the application state:

| Store               | Scope                       | Key State                                     | Uses                                                          |
| ------------------- | --------------------------- | --------------------------------------------- | ------------------------------------------------------------- |
| `DashboardStore`    | Root (`providedIn: 'root'`) | portfolio total, summary P&L                  | `withState`, `withComputed`, `withMethods`                    |
| `StocksStore`       | Feature-scoped              | search results, selected quote, loading/error | `withState`, `withComputed`, `withMethods`                    |
| `WatchlistsStore`   | Feature-scoped              | watchlist list, selected watchlist            | `withState`, `withComputed`, `withMethods`                    |
| `HoldingsStore`     | Feature-scoped              | holdings for active watchlist                 | `withEntities<HoldingSummary>()`, `withState`, `withComputed` |
| `TransactionsStore` | Feature-scoped              | transactions for active holding               | `withEntities<Transaction>()`, `withState`, `withMethods`     |

All async operations follow the standardised pattern:

```typescript
methodName: async () => {
  patchState(store, { loading: true, error: null });
  try {
    const result = await firstValueFrom(service.method());
    patchState(store, { ...updatedState, loading: false });
  } catch (err) {
    patchState(store, { error: err.message, loading: false });
  }
};
```

### Data Model

See [data-model.md](data-model.md) for full schema.

**Summary**:

- **`watchlists` container** (partition key: `/id`): Stores watchlist metadata + embedded holdings summary array.
- **`transactions` container** (partition key: `/watchlistId`): Immutable transaction ledger (Buy / Sell / Dividend).

### API Contract

See [contracts/api.md](contracts/api.md) for full endpoint specifications.

**Endpoint summary**:

| Method | Path                                                | Purpose                              |
| ------ | --------------------------------------------------- | ------------------------------------ |
| GET    | `/api/stocks/search?q=`                             | Search stocks by name or symbol      |
| GET    | `/api/stocks/{symbol}`                              | Get live stock quote                 |
| GET    | `/api/watchlists`                                   | List all watchlists                  |
| POST   | `/api/watchlists`                                   | Create watchlist                     |
| GET    | `/api/watchlists/{id}`                              | Get watchlist with holdings          |
| PUT    | `/api/watchlists/{id}`                              | Update name/description              |
| DELETE | `/api/watchlists/{id}`                              | Delete watchlist + transactions      |
| POST   | `/api/watchlists/{id}/holdings`                     | Add stock to watchlist (initial buy) |
| POST   | `/api/watchlists/{wId}/holdings/{hId}/transactions` | Add buy/sell/dividend                |
| GET    | `/api/watchlists/{wId}/holdings/{hId}/transactions` | List transaction history             |
| GET    | `/api/watchlists/{id}/dashboard`                    | Full P&L dashboard with live prices  |

### Quickstart

See [quickstart.md](quickstart.md) for developer setup instructions.

---

## Constitution Check (Post-Design)

No constitution principles are defined for this project. No violations to report.

The design adheres to general software engineering best practices:

- Clear separation of concerns (domain, infrastructure, features, signal stores)
- Testable by design (repositories behind interfaces, MediatR handlers independently testable, stores injectable and testable via TestBed)
- NgRx Signal Store adds appropriate structure for the 5-feature scope without over-engineering

---

## Next Steps

Run `/speckit.tasks` to generate the implementation task breakdown (`tasks.md`).
