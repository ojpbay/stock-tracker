# Research: Stock Tracker Application

**Phase**: 0 — Research
**Date**: 2026-03-27
**Branch**: `001-stock-tracker-app`

---

## Decision 1: Frontend Framework & Version

**Decision**: Angular v21, standalone components only (no NgModules)
**Rationale**: Standalone components have been the Angular standard since v14 and are the default by v21. NgModules are now optional legacy architecture. Standalone removes the module boilerplate and aligns with the current Angular direction for all new projects.
**Alternatives considered**: React (rejected — user specified Angular), NgModule-based Angular (rejected — deprecated pattern in v21)

---

## Decision 2: Angular State Management

**Decision**: NgRx Signal Store (`@ngrx/signals` v21) — one feature store per domain area, `withEntities()` for collections
**Rationale**: The user explicitly chose NgRx Signal Store. Beyond the explicit preference, it is well-suited to this application: 5 feature areas (stocks, watchlists, holdings, transactions, dashboard) with shared derived state (e.g., dashboard portfolio value depends on holdings and live prices). NgRx Signal Store sits in the sweet spot between plain service-based signals (insufficient structure for cross-feature derived state) and classic NgRx Store (excessive boilerplate, actions/reducers/effects ceremony). It is built on Angular Signals, so it retains all the change-detection benefits of signals while providing `signalStore()` / `withState()` / `withComputed()` / `withMethods()` / `withHooks()` as a consistent, declarative pattern. `withEntities()` from `@ngrx/signals/entities` handles collection management (add/update/remove, O(1) `entityMap()` lookups) for holdings and transactions without manual array manipulation.
**Store hierarchy**:
- `DashboardStore` (root/`providedIn: 'root'`): portfolio value, top gainers/losers — aggregates from other stores
- `StocksStore` (feature-scoped): search results, selected stock quote, loading/error state
- `WatchlistsStore` (feature-scoped): watchlist list, selected watchlist, CRUD operations
- `HoldingsStore` (feature-scoped, `withEntities<Holding>()`): all holdings for active watchlist
- `TransactionsStore` (feature-scoped, `withEntities<Transaction>()`): transaction history for active holding
**Async pattern**: each `withMethods()` method sets `loading: true`, calls `firstValueFrom(service.method())`, then `patchState` on success/error
**Alternatives considered**: Plain Angular Signals + service-based state (rejected by user preference; also: insufficient declarative structure for cross-feature derived state at this scale), Classic NgRx Store with actions/reducers/effects (rejected — excessive boilerplate; no time-travel debugging requirement justifies the overhead), RxJS BehaviorSubjects (rejected — Signals are the modern standard)

---

## Decision 3: Angular Routing

**Decision**: Lazy-loaded routes using `loadComponent` / `loadChildren` with functional route guards
**Rationale**: Lazy loading is mandatory best practice for production Angular apps. `loadComponent` for single views and `loadChildren` for feature route groups. Functional guards (introduced v15, standard by v21) replace class-based guards — cleaner, DI-friendly via `inject()`, no class ceremony.
**Alternatives considered**: Eager loading (rejected — poor initial load performance), class-based guards (rejected — deprecated pattern)

---

## Decision 4: Angular Material

**Decision**: Angular Material v3 (MDC — Material Design Components)
**Rationale**: Material v3/MDC is the default theme engine from Angular Material v17+. It provides better performance, accessibility, and compliance with Material Design 3 spec. All new components use MDC. Material v2 styling is in maintenance mode. Use `appearance="outline"` for form fields as the modern standard.
**Alternatives considered**: Material v2 styling (rejected — deprecated), PrimeNG / other UI libraries (rejected — user specified Angular Material)

---

## Decision 5: Chart.js Integration

**Decision**: `ng2-charts` wrapper library over direct Chart.js
**Rationale**: `ng2-charts` is a thin Angular wrapper (~0.5KB overhead) that handles Angular change detection integration correctly, preventing memory leaks that occur with direct Chart.js instantiation in SPAs (Chart.js instances not properly destroyed on component teardown). It exposes Chart.js `ChartConfiguration` types directly, giving full access to the Chart.js API with no abstraction penalty. It integrates cleanly with Angular Signals via `computed()` for reactive chart data.
**Alternatives considered**: Direct Chart.js (`new Chart(canvas, config)`) (rejected — manual destroy lifecycle required, no change detection), ApexCharts (rejected — user specified Chart.js)

---

## Decision 6: HTTP Client Pattern

**Decision**: `provideHttpClient()` with functional interceptors; typed `HttpClient.get<T>()` calls; `shareReplay(1)` for cacheable requests
**Rationale**: Functional HTTP interceptors are the Angular v15+ standard, replacing class-based `HttpInterceptor`. They integrate with `inject()` for DI, are tree-shakeable, and require no class ceremony. `withXsrfProtection()` is included automatically. A single error-handling interceptor normalises API errors across the app.
**Alternatives considered**: Class-based interceptors (rejected — legacy pattern), Apollo / GraphQL client (rejected — REST API is specified)

---

## Decision 7: Angular Testing Strategy

**Decision**: Jest for unit and component tests; Angular `TestBed` for component integration; Cypress for E2E (out of scope for v1 implementation)
**Rationale**: Jest is 10–30x faster than Karma/Jasmine for medium-to-large test suites, has better TypeScript support, and is now widely adopted in the Angular community. `jest-preset-angular` handles Angular-specific transforms. `HttpClientTestingModule` and `provideHttpClientTesting()` handle HTTP mocking in component tests. Signals are testable via direct `.set()` calls followed by `fixture.detectChanges()`.
**Alternatives considered**: Karma/Jasmine (rejected — slower, declining community support), Vitest (rejected — Jest has better Angular tooling)

---

## Decision 8: .NET API Architecture

**Decision**: Controller-based API with Vertical Slice Architecture and MediatR
**Rationale**: The stock tracker has ~12 distinct API endpoints across 4 domain areas (stocks, watchlists, holdings, transactions), making controller-based organisation cleaner than flat minimal API files. Vertical Slice Architecture groups all code for a given operation (command/query, handler, validator) in a single feature folder, avoiding the horizontal coupling of traditional layered architecture. MediatR provides the command/query routing with no direct handler-to-handler coupling. This architecture is the modern .NET standard for APIs of this complexity.
**Alternatives considered**: Minimal APIs (rejected — insufficient structure for 12+ endpoints), Traditional layered (Controllers → Services → Repositories) (rejected — horizontal coupling, harder to test in isolation), CQRS with event sourcing (rejected — over-engineered for this scope)

---

## Decision 9: Azure Cosmos DB Driver

**Decision**: `Microsoft.Azure.Cosmos` SDK directly (not EF Core Cosmos provider)
**Rationale**: The EF Core Cosmos provider abstracts away partition keys, RU provisioning, and document structure — Cosmos-specific concepts that are fundamental to correct performance and cost management. For a document-oriented domain (watchlists with embedded holdings), the Cosmos SDK gives direct control over partition key design, container creation, and query optimisation. The domain entities map naturally to JSON documents without a relational abstraction layer.
**Alternatives considered**: EF Core + Cosmos provider (rejected — hides partition key management, performance pitfalls), Azure Table Storage (rejected — less capable querying), SQL Server (rejected — user specified Cosmos DB)

---

## Decision 10: Cosmos DB Container Design

**Decision**: Two containers — `watchlists` (partition key: `/id`) and `transactions` (partition key: `/watchlistId`)
**Rationale**: A watchlist document stores the watchlist metadata and its holdings summary (units, average price, last purchase date). Transactions are stored separately to prevent unbounded document growth as holdings accumulate dozens or hundreds of transactions over time. The `transactions` container partitions by `watchlistId` so all transactions for a watchlist are co-located, enabling efficient range queries (all transactions for a holding). The split keeps watchlist documents fast to read for dashboard rendering while keeping the transaction ledger scalable.
**Alternatives considered**: Single container with all entities (rejected — unbounded document growth), Separate container per entity (watchlists, holdings, transactions) (rejected — unnecessary cross-partition joins for the holdings summary use case), Fully embedded (watchlist → holdings → transactions in one document) (rejected — document size limits and RU costs for large portfolios)

---

## Decision 11: Cosmos DB Local Development

**Decision**: Docker-based Azure Cosmos DB Linux Emulator
**Rationale**: The official Microsoft Cosmos DB Linux emulator Docker image (`mcr.microsoft.com/cosmosdb/linux/azure-cosmos-emulator`) runs on port 8081 and faithfully emulates the Cosmos DB NoSQL API. It supports multiple partitions and is the supported approach for local development and CI. The Windows installer-based emulator is an alternative but Docker ensures consistency across developer environments and CI pipelines. A self-signed certificate bypass is applied only in development environments via `appsettings.Development.json`.
**Alternatives considered**: Windows Cosmos DB Emulator installer (acceptable alternative but environment-specific), In-memory test double (rejected — insufficient fidelity for integration tests)

---

## Decision 12: .NET Testing Strategy

**Decision**: xUnit for all tests; `Moq` for mocking in unit tests; `WebApplicationFactory<Program>` with Cosmos Emulator for integration tests
**Rationale**: xUnit is the de-facto standard for .NET testing. `Moq` is the most widely used mocking library with good interface coverage. Integration tests use `WebApplicationFactory` to spin up the full ASP.NET Core pipeline in-process, with the Cosmos Emulator connection string overridden via `ConfigureServices`. Each integration test class implements `IAsyncLifetime` to seed and clean up test data.
**Alternatives considered**: NUnit (accepted alternative, no strong preference), TestContainers with Cosmos (viable but more complex setup than the emulator for local dev)

---

## Decision 13: Stock Market Data Provider

**Decision**: Finnhub (free tier — 60 requests/min)
**Rationale**: Finnhub provides real-time stock quotes, company profiles, and search across major exchanges (NYSE, NASDAQ, LSE, ASX etc.) with 60 requests/minute on the free tier. This is sufficient for a personal stock tracker refreshing portfolio data on demand. The .NET integration uses `IHttpClientFactory` with a named `FinnhubClient` registered as a typed `HttpClient`. API key is stored in `appsettings.Development.json` (gitignored) and injected via `IOptions<FinnhubOptions>`.
**Alternatives considered**: Alpha Vantage (rejected — 25 req/day free tier is insufficient), Yahoo Finance unofficial API (rejected — no official support, subject to breaking changes), Polygon.io (acceptable alternative, similar free tier), Financial Modeling Prep (acceptable for fundamentals data supplement)

---

## Decision 14: OpenAPI Documentation

**Decision**: Built-in `Microsoft.AspNetCore.OpenApi` (`AddOpenApi()`) with Scalar UI (or SwaggerUI)
**Rationale**: .NET 10 ships with a built-in OpenAPI document generator (`AddOpenApi()`) that replaces the previous Swashbuckle dependency. Response type annotations on controllers feed into the generated schema automatically. The API contract documentation (see `contracts/`) is the source of truth for the Angular `HttpClient` typed service models.
**Alternatives considered**: Swashbuckle (still works in .NET 10 but no longer the default), NSwag (viable for auto-generating Angular client)

---

## Decision 15: CORS Configuration

**Decision**: Named CORS policy `AllowAngularDev` for local development (`http://localhost:4200`); environment-specific production origin via `appsettings`
**Rationale**: Strict origin allowlisting prevents cross-site request issues. Development and production origins are separated so the production build never allows `localhost`. `AllowAnyMethod()` and `AllowAnyHeader()` are acceptable for a personal application; tighten to specific methods/headers if exposing publicly.
**Alternatives considered**: Wildcard CORS (rejected — poor security practice even for personal apps)
