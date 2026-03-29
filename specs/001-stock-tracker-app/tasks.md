# Tasks: Stock Tracker Application

**Input**: Design documents from `/specs/001-stock-tracker-app/`
**Prerequisites**: plan.md ✓, spec.md ✓, research.md ✓, data-model.md ✓, contracts/api.md ✓, quickstart.md ✓
**Tests**: Included — spec explicitly requires unit and integration tests.
**Organization**: Tasks grouped by user story for independent implementation and testing.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no shared dependencies)
- **[Story]**: Which user story this belongs to (US1–US4)

---

## Phase 1: Setup (Project Initialization)

**Purpose**: Scaffold both projects, configure tooling, verify empty builds pass.

- [x] T001 Create root folder structure: `api/`, `client/`, `specs/` per plan.md
- [x] T002 Initialize .NET 10 solution: `api/StockTracker.sln` with three projects — `api/src/StockTracker.Api`, `api/tests/StockTracker.UnitTests`, `api/tests/StockTracker.IntegrationTests`
- [x] T003 Add NuGet packages to `api/src/StockTracker.Api`: `Microsoft.Azure.Cosmos`, `MediatR`, `FluentValidation.AspNetCore`, `Microsoft.AspNetCore.OpenApi`
- [x] T004 Add NuGet packages to `api/tests/StockTracker.UnitTests`: `xunit`, `Moq`, `FluentAssertions`, project reference to `StockTracker.Api`
- [x] T005 Add NuGet packages to `api/tests/StockTracker.IntegrationTests`: `xunit`, `Microsoft.AspNetCore.Mvc.Testing`, `FluentAssertions`, project reference to `StockTracker.Api`
- [x] T006 [P] Initialize Angular 20 project in `client/` using Angular CLI (v20 latest available): `ng new client --standalone --routing --style=scss`
- [x] T007 [P] Add Angular dependencies: `@angular/material`, `@ngrx/signals`, `ng2-charts`, `chart.js`
- [x] T008 Configure Jest for Angular: create `client/jest.config.js`, `client/setup-jest.ts`, install `jest`, `jest-preset-angular`, `@types/jest`; replaced Karma in `angular.json` with jest runner
- [x] T009 Create `client/proxy.conf.json` to proxy `/api/*` to `http://localhost:5000`; referenced in `client/angular.json` under `serve.options.proxyConfig`
- [x] T010 [P] `.gitignore` created covering .NET, Angular/Node.js, secrets (`appsettings.Development.json`), IDE files

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Infrastructure that MUST be complete before any user story work begins.

**⚠️ CRITICAL**: No user story work can begin until this phase is complete.

- [x] T011 Create `api/src/StockTracker.Api/Infrastructure/Cosmos/CosmosDbInitialiser.cs`: creates `StockTrackerDb` database and `watchlists` / `transactions` containers on startup using `CosmosClient.CreateDatabaseIfNotExistsAsync` and `CreateContainerIfNotExistsAsync`
- [x] T012 Register `CosmosClient` as singleton in `api/src/StockTracker.Api/Program.cs` with emulator SSL bypass in Development; call `CosmosDbInitialiser` on app startup
- [x] T013 [P] Configure MediatR, FluentValidation, CORS (`AllowAngularDev` policy for `http://localhost:4200`), and OpenAPI (`AddOpenApi()`) in `api/src/StockTracker.Api/Program.cs`
- [x] T014 [P] Create `api/src/StockTracker.Api/Infrastructure/StockData/IStockDataService.cs` interface with `SearchAsync(query)` and `GetQuoteAsync(symbol)` methods
- [x] T015 [P] Create `api/src/StockTracker.Api/Infrastructure/StockData/FinnhubOptions.cs` and wire `appsettings` binding in `Program.cs`
- [x] T016 Create `api/tests/StockTracker.IntegrationTests/StockTrackerApiFactory.cs`: `WebApplicationFactory<Program>` that overrides CosmosDB connection string with emulator credentials and seeds/cleans data via `IAsyncLifetime`
- [x] T017 [P] Configure `client/src/app/app.config.ts`: `provideRouter(APP_ROUTES, withPreloading(PreloadAllModules))`, `provideHttpClient(withInterceptors([...]))`, `provideAnimationsAsync()`
- [x] T018 [P] Create `client/src/app/core/interceptors/error.interceptor.ts`: functional interceptor that catches `HttpErrorResponse` and maps to user-facing error messages
- [x] T019 [P] Apply Angular Material theme in `client/src/styles.scss`; add `MatSnackBarModule` to `app.config.ts` for global notifications
- [x] T020 [P] Create `client/src/app/shared/components/loading-spinner/loading-spinner.component.ts`: standalone component wrapping `MatProgressSpinner`
- [x] T021 [P] Create `client/src/app/shared/components/pnl-indicator/pnl-indicator.component.ts`: standalone component accepting `pnl: number` input; applies green/red styling and up/down arrow based on sign
- [x] T022 [P] Create `client/src/app/shared/components/price-badge/price-badge.component.ts`: standalone component showing current price and daily change percentage with colour coding

**Checkpoint**: Both projects build and pass empty test suites. CosmosDB emulator can be started and the API initialises both containers.

---

## Phase 3: User Story 1 — Stock Search & Discovery (Priority: P1) 🎯 MVP

**Goal**: Users can search for stocks by name or ticker symbol, view high-level stock data, and navigate to a detail view. The Finnhub integration is live.

**Independent Test**: Start API + client; search for "Apple" → results appear; select AAPL → detail view shows current price and daily change. No watchlist functionality required.

### Tests for User Story 1

- [x] T023 [P] [US1] Unit test `SearchStocksHandler` (mock `IStockDataService`) in `api/tests/StockTracker.UnitTests/Features/Stocks/SearchStocksHandlerTests.cs`: verify query forwarded, results mapped, empty query returns validation error
- [x] T024 [P] [US1] Unit test `GetStockQuoteHandler` (mock `IStockDataService`) in `api/tests/StockTracker.UnitTests/Features/Stocks/GetStockQuoteHandlerTests.cs`: valid symbol returns quote; unknown symbol returns 404 result
- [x] T025 [P] [US1] Integration test `GET /api/stocks/search` in `api/tests/StockTracker.IntegrationTests/Stocks/StockSearchIntegrationTests.cs`: missing `q` param returns 400; valid query returns results array
- [x] T026 [P] [US1] Integration test `GET /api/stocks/{symbol}` in `api/tests/StockTracker.IntegrationTests/Stocks/StockQuoteIntegrationTests.cs`: unknown symbol returns 404; valid symbol returns quote shape
- [x] T027 [P] [US1] Unit test `StocksStore` in `client/src/app/features/stocks/store/stocks.store.spec.ts`: initial state empty; `searchStocks()` sets loading then results; error path sets `error` signal
- [x] T028 [P] [US1] Component test `StockSearchComponent` in `client/src/app/features/stocks/search/stock-search.component.spec.ts`: typing in search field triggers store `searchStocks()`; results rendered in list

### Implementation for User Story 1

- [x] T029 [P] [US1] Implement `FinnhubClient` in `api/src/StockTracker.Api/Infrastructure/StockData/FinnhubClient.cs`: `IHttpClientFactory`-based typed client; implement `SearchAsync` (`/search`) and `GetQuoteAsync` (`/quote` + `/profile2`); register as typed `HttpClient` in `Program.cs`
- [x] T030 [P] [US1] Implement `SearchStocksQuery`, `SearchStocksQueryValidator`, `SearchStocksHandler` in `api/src/StockTracker.Api/Features/Stocks/Search/`: handler calls `IStockDataService.SearchAsync`; maps results to `StockSearchResultDto[]`
- [x] T031 [P] [US1] Implement `GetStockQuoteQuery`, `GetStockQuoteHandler` in `api/src/StockTracker.Api/Features/Stocks/GetQuote/`: calls `IStockDataService.GetQuoteAsync`; returns 404 if symbol unrecognised
- [x] T032 [US1] Implement `StocksController` in `api/src/StockTracker.Api/Features/Stocks/`: `GET /api/stocks/search?q=` and `GET /api/stocks/{symbol}` endpoints; `[ProducesResponseType]` attributes for OpenAPI (depends T030, T031)
- [x] T033 [P] [US1] Create `StocksStore` in `client/src/app/features/stocks/store/stocks.store.ts`: `signalStore()` with `withState({ results, selectedQuote, loading, error })`, `withComputed`, `withMethods({ searchStocks, loadQuote, clearResults })`
- [x] T034 [P] [US1] Create `StocksService` in `client/src/app/features/stocks/services/stocks.service.ts`: `HttpClient` typed calls to `GET /api/stocks/search` and `GET /api/stocks/{symbol}`; returns typed observables
- [x] T035 [US1] Create `StockSearchComponent` in `client/src/app/features/stocks/search/stock-search.component.ts`: `MatFormField` + `MatInput` debounced search; `MatList` results; routes to detail on selection (depends T033, T034)
- [x] T036 [US1] Create `StockDetailComponent` in `client/src/app/features/stocks/detail/stock-detail.component.ts`: displays full quote using `MatCard`; shows `price-badge` component; "Add to Watchlist" button stub for US2 (depends T033)
- [x] T037 [US1] Configure `client/src/app/features/stocks/stocks.routes.ts` with `loadComponent` for search and detail; register under `/stocks` in `client/src/app/app.routes.ts`

**Checkpoint**: `GET /api/stocks/search?q=Apple` returns results. Angular search page displays results and navigates to detail view. All US1 tests pass.

---

## Phase 4: User Story 2 — Watchlist Creation & Stock Addition (Priority: P2)

**Goal**: Users can create named watchlists with descriptions, add stocks to them with purchase details (units, price, date), and view the holdings list. Edit and delete watchlist name/description.

**Independent Test**: Create a watchlist "Tech Stocks"; search for AAPL; add to watchlist with 10 units @ $150 on 2026-01-01; navigate to watchlist and see AAPL listed with those details. No P&L or charts required.

### Tests for User Story 2

- [x] T038 [P] [US2] Unit test `CreateWatchlistHandler` in `api/tests/StockTracker.UnitTests/Features/Watchlists/CreateWatchlistHandlerTests.cs`: valid command creates and returns watchlist; duplicate name returns validation error
- [x] T039 [P] [US2] Unit test `AddHoldingHandler` in `api/tests/StockTracker.UnitTests/Features/Holdings/AddHoldingHandlerTests.cs`: new stock creates holding + transaction; duplicate symbol adds to existing holding; future date rejected; units ≤ 0 rejected
- [x] T040 [P] [US2] Integration test `POST/GET/PUT/DELETE /api/watchlists` in `api/tests/StockTracker.IntegrationTests/Watchlists/WatchlistCrudIntegrationTests.cs`: full CRUD round-trip against Cosmos emulator
- [x] T041 [P] [US2] Integration test `POST /api/watchlists/{id}/holdings` in `api/tests/StockTracker.IntegrationTests/Holdings/AddHoldingIntegrationTests.cs`: adds holding; returns updated holding summary; symbol not found returns 400
- [x] T042 [P] [US2] Unit test `WatchlistsStore` in `client/src/app/features/watchlists/store/watchlists.store.spec.ts`: `loadWatchlists` populates state; `createWatchlist` appends to list; `updateWatchlist` patches in place
- [x] T043 [P] [US2] Component test `WatchlistEditComponent` in `client/src/app/features/watchlists/edit/watchlist-edit.component.spec.ts`: form validation; submit calls store method

### Implementation for User Story 2

- [x] T044 [P] [US2] Implement `Watchlist` domain entity in `api/src/StockTracker.Api/Domain/Watchlist.cs`: properties matching data-model.md; `AddOrUpdateHolding(HoldingSummary)` method recalculates `totalUnits` and `averagePurchasePrice`
- [x] T045 [P] [US2] Implement `Holding` domain entity (embedded) in `api/src/StockTracker.Api/Domain/Holding.cs`: `holdingId`, `stockSymbol`, `companyName`, `exchange`, `totalUnits`, `averagePurchasePrice`, `lastPurchaseDate`, `status`
- [x] T046 [US2] Implement `WatchlistRepository` in `api/src/StockTracker.Api/Infrastructure/Cosmos/WatchlistRepository.cs`: `GetAllAsync`, `GetByIdAsync`, `CreateAsync`, `UpdateAsync`, `DeleteAsync` using `Microsoft.Azure.Cosmos` container client (depends T044, T045)
- [x] T047 [US2] Implement List/Create/Get/Update/Delete Watchlist features (query+command+handler+validator per operation) in `api/src/StockTracker.Api/Features/Watchlists/` (depends T046)
- [x] T048 [US2] Implement `WatchlistsController` in `api/src/StockTracker.Api/Features/Watchlists/WatchlistsController.cs`: all 5 endpoints from contracts/api.md (depends T047)
- [x] T049 [US2] Implement `AddHoldingCommand`, `AddHoldingCommandValidator`, `AddHoldingHandler` in `api/src/StockTracker.Api/Features/Holdings/AddHolding/`: validates symbol via `IStockDataService`; calls `WatchlistRepository` to save; returns updated holding summary (depends T046)
- [x] T050 [US2] Implement `HoldingsController` in `api/src/StockTracker.Api/Features/Holdings/HoldingsController.cs`: `POST /api/watchlists/{watchlistId}/holdings` (depends T049)
- [x] T051 [P] [US2] Create `WatchlistsStore` in `client/src/app/features/watchlists/store/watchlists.store.ts`: `signalStore({ providedIn: 'WatchlistsFeatureComponent' })` with `withState({ watchlists, selectedId, loading, error })`, `withComputed({ selectedWatchlist })`, `withMethods({ loadWatchlists, createWatchlist, updateWatchlist, deleteWatchlist, selectWatchlist })`
- [x] T052 [P] [US2] Create `WatchlistsService` in `client/src/app/features/watchlists/services/watchlists.service.ts`: typed `HttpClient` calls for all 5 watchlist endpoints
- [x] T053 [P] [US2] Create `HoldingsService` in `client/src/app/features/holdings/services/holdings.service.ts`: typed `HttpClient` call for `POST /api/watchlists/{id}/holdings`
- [x] T054 [US2] Create `WatchlistListComponent` in `client/src/app/features/watchlists/list/watchlist-list.component.ts`: `MatList` of watchlists; "New Watchlist" button; navigates to edit (depends T051, T052)
- [x] T055 [US2] Create `WatchlistEditComponent` in `client/src/app/features/watchlists/edit/watchlist-edit.component.ts`: `MatFormField` name + description form; create/update via store; delete with `MatDialog` confirmation (depends T051, T052)
- [x] T056 [US2] Create `AddHoldingComponent` in `client/src/app/features/holdings/add-holding/add-holding.component.ts`: form for units, price-per-unit, date (`MatDatepicker`); submits via `HoldingsService`; navigates back on success (depends T051, T053)
- [x] T057 [US2] Configure `client/src/app/features/watchlists/watchlists.routes.ts` and `client/src/app/features/holdings/holdings.routes.ts`; register under app routes; wire "Add to Watchlist" button in `StockDetailComponent` (T036) to navigate to `AddHoldingComponent`

**Checkpoint**: Full watchlist CRUD works. User can create a watchlist, add a stock with purchase details, and see it listed. All US2 tests pass.

---

## Phase 5: User Story 3 — Portfolio Dashboard & P&L View (Priority: P3)

**Goal**: The watchlist dashboard shows each holding's stock name, symbol, units held, last purchase date, average purchase price, current value, and a graphical P&L indicator. Overall watchlist P&L is shown in the summary panel.

**Independent Test**: Open a watchlist with pre-seeded holdings; dashboard loads within 3 seconds; each row shows correct figures; a holding with gain shows green P&L chart; overall summary shows correct total. No transaction recording required.

### Tests for User Story 3

- [x] T058 [P] [US3] Unit test `GetDashboardHandler` in `api/tests/StockTracker.UnitTests/Features/Dashboard/GetDashboardHandlerTests.cs`: mock `WatchlistRepository` + `IStockDataService`; verify P&L calculations (unrealised = units × (currentPrice − avgPurchasePrice)); stale price flag when provider unavailable
- [x] T059 [P] [US3] Integration test `GET /api/watchlists/{id}/dashboard` in `api/tests/StockTracker.IntegrationTests/Dashboard/DashboardIntegrationTests.cs`: seeded watchlist returns correct summary structure; 404 for unknown watchlist
- [x] T060 [P] [US3] Unit test `DashboardStore` in `client/src/app/features/dashboard/store/dashboard.store.spec.ts`: `loadDashboard` populates holdings with P&L values; `isLoading` signal true during load; summary totals computed correctly
- [ ] T061 [P] [US3] Component test `DashboardComponent` in `client/src/app/features/dashboard/dashboard.component.spec.ts`: renders holdings table with correct column values; `pnl-indicator` rendered per holding

### Implementation for User Story 3

- [x] T062 [US3] Implement `GetDashboardQuery`, `GetDashboardHandler` in `api/src/StockTracker.Api/Features/Dashboard/GetDashboard/`: loads watchlist from `WatchlistRepository`; fetches current prices for all active holdings via `IStockDataService`; computes `unrealisedPnL`, `realisedPnL`, `dividendIncome`, `totalPnL` per holding and overall summary; returns `DashboardResponseDto` (depends T046)
- [x] T063 [US3] Implement `DashboardController` in `api/src/StockTracker.Api/Features/Dashboard/DashboardController.cs`: `GET /api/watchlists/{id}/dashboard` (depends T062)
- [x] T064 [P] [US3] Create `DashboardStore` (root-scoped) in `client/src/app/features/dashboard/store/dashboard.store.ts`: `signalStore({ providedIn: 'root' })` with `withState({ dashboardData, loading, error })`, `withComputed({ holdingRows, summary })`, `withMethods({ loadDashboard })`, `withHooks({ onInit })` for auto-load
- [x] T065 [P] [US3] Create `DashboardService` in `client/src/app/features/dashboard/services/dashboard.service.ts`: typed `HttpClient` call to `GET /api/watchlists/{id}/dashboard`
- [x] T066 [US3] Create `DashboardComponent` in `client/src/app/features/dashboard/dashboard.component.ts`: `MatTable` with columns (name, symbol, units, lastPurchaseDate, avgPrice, currentValue, P&L); summary panel with overall totals; uses `DashboardStore` signals (depends T064, T065)
- [x] T067 [US3] Create `HoldingRowComponent` in `client/src/app/features/dashboard/holding-row/holding-row.component.ts`: renders a single holding row; uses `pnl-indicator` component; clicking a row navigates to transaction history (depends T021)
- [x] T068 [US3] Create `PnlChartComponent` in `client/src/app/features/dashboard/pnl-chart/pnl-chart.component.ts`: `ng2-charts` line/bar chart showing P&L trend per holding; chart data derived from `DashboardStore` via `computed()`; colour-coded datasets (positive = green, negative = red)
- [x] T069 [US3] Configure `client/src/app/features/dashboard/dashboard.routes.ts`; register as default route in `app.routes.ts`

**Checkpoint**: Dashboard loads with live prices and correct P&L per holding. Chart renders. Overall summary is accurate. All US3 tests pass.

---

## Phase 6: User Story 4 — Transaction Management (Priority: P4)

**Goal**: Users can record additional share purchases (recalculates average price), dividend income, and partial/full sales against existing holdings. Full transaction history is viewable.

**Independent Test**: Open a holding; record a buy (+5 units @ $160) → units and average price update; record a dividend ($12.50) → income shown; record a partial sell (3 units @ $175) → units decrease; view transaction history showing all three entries chronologically.

### Tests for User Story 4

- [x] T070 [P] [US4] Unit test `AddTransactionHandler` in `api/tests/StockTracker.UnitTests/Features/Transactions/AddTransactionHandlerTests.cs`: Buy recalculates weighted average price; Sell updates units and rejects oversell; Dividend records amount; future date rejected
- [x] T071 [P] [US4] Unit test `Transaction` domain entity in `api/tests/StockTracker.UnitTests/Domain/TransactionTests.cs`: factory methods for Buy/Sell/Dividend enforce field rules
- [x] T072 [P] [US4] Integration test `POST /api/watchlists/{wId}/holdings/{hId}/transactions` in `api/tests/StockTracker.IntegrationTests/Transactions/AddTransactionIntegrationTests.cs`: Buy returns updated holding; Sell beyond units returns 400 with `INSUFFICIENT_UNITS`; Dividend records income
- [x] T073 [P] [US4] Integration test `GET /api/watchlists/{wId}/holdings/{hId}/transactions` in `api/tests/StockTracker.IntegrationTests/Transactions/ListTransactionsIntegrationTests.cs`: returns chronological list; `type` filter works; date range filter works
- [x] T074 [P] [US4] Unit test `TransactionsStore` in `client/src/app/features/transactions/store/transactions.store.spec.ts`: `loadTransactions` populates entities; `addTransaction` appends and triggers holding update; error state on failure
- [x] T075 [P] [US4] Unit test `HoldingsStore` in `client/src/app/features/holdings/store/holdings.store.spec.ts`: `withEntities` operations; `addHolding` adds entity; `updateHolding` patches correctly
- [x] T076 [P] [US4] Component test `AddTransactionComponent` in `client/src/app/features/transactions/add-transaction/add-transaction.component.spec.ts`: Buy form shows units + price; Dividend form shows amount only; validation prevents future dates

### Implementation for User Story 4

- [x] T077 [P] [US4] Implement `Transaction` domain entity + `TransactionType` enum in `api/src/StockTracker.Api/Domain/Transaction.cs` and `api/src/StockTracker.Api/Domain/TransactionType.cs`: factory methods `CreateBuy(...)`, `CreateSell(...)`, `CreateDividend(...)`; immutable properties
- [x] T078 [US4] Implement `TransactionRepository` in `api/src/StockTracker.Api/Infrastructure/Cosmos/TransactionRepository.cs`: `CreateAsync`, `GetByHoldingAsync(watchlistId, holdingId)`, `GetByWatchlistAsync(watchlistId)` using `transactions` container (depends T077)
- [x] T079 [US4] Implement `AddTransactionCommand`, `AddTransactionCommandValidator`, `AddTransactionHandler` in `api/src/StockTracker.Api/Features/Transactions/AddTransaction/`: validates Buy/Sell/Dividend rules; for Sell validates units against current holding; saves transaction; updates holding summary on watchlist document (depends T078, T046)
- [x] T080 [US4] Implement `ListTransactionsQuery`, `ListTransactionsHandler` in `api/src/StockTracker.Api/Features/Transactions/ListTransactions/`: returns transactions for a holding with optional `type` and date-range filters, sorted by `transactionDate` descending (depends T078)
- [x] T081 [US4] Implement `TransactionsController` in `api/src/StockTracker.Api/Features/Transactions/TransactionsController.cs`: `POST /api/watchlists/{wId}/holdings/{hId}/transactions` and `GET /api/watchlists/{wId}/holdings/{hId}/transactions` (depends T079, T080)
- [x] T082 [P] [US4] Create `HoldingsStore` (feature-scoped, `withEntities<HoldingSummary>()`) in `client/src/app/features/holdings/store/holdings.store.ts`: `signalStore()` with `withEntities<HoldingSummary>()`, `withState({ loading, error })`, `withComputed({ allHoldings })`, `withMethods({ loadHoldings, addHolding, updateHolding })`
- [x] T083 [P] [US4] Create `TransactionsStore` (feature-scoped, `withEntities<Transaction>()`) in `client/src/app/features/transactions/store/transactions.store.ts`: `signalStore()` with `withEntities<Transaction>()`, `withState({ loading, error, activeHoldingId, activeWatchlistId })`, `withMethods({ loadTransactions, addTransaction })`
- [x] T084 [P] [US4] Create `TransactionsService` in `client/src/app/features/transactions/services/transactions.service.ts`: typed `HttpClient` calls for `POST` and `GET` transaction endpoints
- [x] T085 [US4] Create `AddTransactionComponent` in `client/src/app/features/transactions/add-transaction/add-transaction.component.ts`: `MatButtonToggle` for type (Buy/Sell/Dividend); conditional `MatFormField` groups per type; `MatDatepicker` for date; submits via `TransactionsStore.addTransaction()` (depends T083, T084)
- [x] T086 [US4] Create `TransactionHistoryComponent` in `client/src/app/features/transactions/transaction-history/transaction-history.component.ts`: `MatTable` with columns (type icon, date, units, price, amount); `MatChip` type filter; navigates to `AddTransactionComponent` via FAB (depends T083, T084)
- [x] T087 [US4] Configure `client/src/app/features/transactions/transactions.routes.ts`; wire transaction history link from `HoldingRowComponent` (T067); wire add-transaction FAB

**Checkpoint**: Full transaction lifecycle works. Buy/Sell/Dividend recorded correctly. Holding units and average price update after each transaction. Transaction history shows chronological list. All US4 tests pass.

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Navigation shell, error visibility, and final integration validation.

- [x] T088 Create application navigation shell in `client/src/app/app.ts`: `MatToolbar` (app title) + `MatSidenav` with `MatNavList` links to Watchlists and Stock Search
- [x] T089 [P] Add global snackbar notification service in `client/src/app/core/services/notification.service.ts`: exposes `showError(msg)` and `showSuccess(msg)` using `MatSnackBar`; wire into `error.interceptor.ts`
- [x] T090 [P] Add `DELETE /api/watchlists/{id}` confirmation dialog using `MatDialog` (`ConfirmDialogComponent`) in `WatchlistEditComponent`
- [x] T091 [P] Add `priceIsStale` staleness indicator in `DashboardComponent`: show `MatTooltip` warning icon when Finnhub price is stale
- [x] T092 [P] Add API global exception handler middleware in `api/src/StockTracker.Api/Program.cs`: maps unhandled exceptions to `500`; maps `ValidationException` to `400` with field errors
- [x] T093 Quickstart validation verified: proxy.conf.json → http://localhost:5000 wired in angular.json; appsettings.Development.json present; API builds clean; Angular builds clean; 26 .NET unit tests pass; 39 Angular unit tests pass — runtime e2e requires Docker Cosmos emulator + Finnhub API key (see quickstart.md)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — start immediately
- **Foundational (Phase 2)**: Requires Phase 1 complete — **BLOCKS all user stories**
- **US1 (Phase 3)**: Requires Phase 2 complete — no dependency on US2/US3/US4
- **US2 (Phase 4)**: Requires Phase 2 complete — no dependency on US1 (can run in parallel with US1)
- **US3 (Phase 5)**: Requires Phase 2 complete AND US2 (depends on watchlist + holding data model)
- **US4 (Phase 6)**: Requires Phase 2 complete AND US2 (depends on holding data model for sell validation)
- **Polish (Phase 7)**: Requires all desired user stories complete

### User Story Dependencies

```
Phase 1 (Setup)
    ↓
Phase 2 (Foundational)
    ├──→ Phase 3 (US1) — independent
    ├──→ Phase 4 (US2) — independent
          ├──→ Phase 5 (US3) — depends on US2 data model
          └──→ Phase 6 (US4) — depends on US2 data model
                    ↓
              Phase 7 (Polish)
```

### Within Each User Story

- Tests MUST be written before implementation (TDD); verify they fail first
- Domain entities before repositories
- Repositories before handlers
- Handlers before controllers (API)
- Stores + services before components (Angular)
- Routes configured last (after components exist)

### Parallel Opportunities

- Phase 1: T006, T007, T010 can run in parallel with T002–T005
- Phase 2: T013–T015 and T017–T022 can all run in parallel once T011–T012 are done
- Within each US phase: all `[P]` test tasks can be launched simultaneously; all `[P]` implementation tasks can run simultaneously (API side vs Angular side)
- Phase 3 (US1) and Phase 4 (US2) can run in parallel with separate developers

---

## Parallel Example: User Story 1

```
# Launch all US1 tests simultaneously (write + verify they fail):
T023: Unit test SearchStocksHandler
T024: Unit test GetStockQuoteHandler
T025: Integration test GET /api/stocks/search
T026: Integration test GET /api/stocks/{symbol}
T027: Unit test StocksStore
T028: Component test StockSearchComponent

# Then launch implementation in parallel:
T029: FinnhubClient implementation    ← API side
T030: SearchStocksQuery + Handler     ← API side
T031: GetStockQuoteQuery + Handler    ← API side
T033: StocksStore                     ← Angular side
T034: StocksService                   ← Angular side
```

## Parallel Example: User Story 2

```
# All US2 tests together:
T038–T043 (6 test tasks, all [P])

# Domain entities in parallel:
T044: Watchlist entity
T045: Holding entity

# Then service + store layers in parallel:
T046: WatchlistRepository (API)       ← after T044/T045
T051: WatchlistsStore (Angular)       ← after T044/T045 design known
T052: WatchlistsService (Angular)
T053: HoldingsService (Angular)
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1 (Setup) — ~1–2 hours
2. Complete Phase 2 (Foundational) — ~2–3 hours
3. Complete Phase 3 (US1: Stock Search) — ~3–4 hours
4. **STOP and VALIDATE**: Search for a stock, view detail. All US1 tests pass.
5. Demo or continue to US2

### Incremental Delivery

1. **Setup + Foundational** → both projects build, Cosmos emulator connects
2. **US1** → Stock search live, Finnhub integrated, Angular SPA navigates to detail view
3. **US2** → Watchlists created, holdings added with purchase details
4. **US3** → Dashboard with P&L charts and summary
5. **US4** → Full transaction lifecycle (buy/sell/dividend)
6. **Polish** → Navigation shell, error handling, delete watchlist

### Parallel Team Strategy

With two developers after Foundational is complete:
- **Developer A**: US1 (stock search, Finnhub), then US3 (dashboard API + chart component)
- **Developer B**: US2 (watchlist CRUD + add holding), then US4 (transactions)

---

## Notes

- `[P]` tasks have no shared file dependencies and can be launched simultaneously by an AI agent
- Each `[Story]` label maps to the user story in `spec.md` for traceability
- Transactions are **immutable** — no update or delete operations in v1
- The `appsettings.Development.json` (Finnhub API key + Cosmos emulator credentials) must be created manually — it is gitignored
- All Angular components use standalone + `@if`/`@for` control flow — no NgModules
- All Angular state uses NgRx Signal Store — no plain service signals, no classic NgRx actions/reducers
- Cosmos emulator must be running before integration tests execute
