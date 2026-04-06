<!--
  SYNC IMPACT REPORT
  ==================
  Version change: N/A (template) → 1.0.0
  Modified principles: N/A (initial population from template)
  Added sections:
    - Core Principles (5 principles)
    - Technology Stack Constraints
    - Development Workflow
    - Governance
  Removed sections: N/A
  Templates requiring updates:
    - .specify/templates/plan-template.md ✅ No changes needed — Constitution Check section already references this file
    - .specify/templates/spec-template.md ✅ No changes needed — structure aligns with principles
    - .specify/templates/tasks-template.md ✅ No changes needed — test-first and user-story phases align with Principle III
    - .specify/templates/agent-file-template.md ✅ No changes needed — generic structure compatible
  Follow-up TODOs: None — all placeholders resolved.
-->

# Stock Tracker Constitution

## Core Principles

### I. Vertical Slice Architecture (API)

Every API feature MUST live entirely within its own folder under `Features/`. A slice contains
the command or query, its handler, the controller endpoint, and any feature-specific validators
in a single directory. Cross-cutting concerns (auth, logging, error handling) MUST be placed in
`Infrastructure/` or middleware — never scattered across feature folders.

**Rationale**: Vertical slices eliminate cross-feature coupling, make features independently
navigable, and prevent the gravitational pull toward anemic domain layers. Finding all code
for a feature MUST require opening only one folder.

### II. Standalone Angular Components with NgRx Signal Store

Every Angular component MUST be declared as `standalone: true`. The template and styles must be contained in corresponding, seperate files. Feature state MUST be managed
via `signalStore()` from `@ngrx/signals`. Collection state (holdings, transactions) MUST use
`withEntities<T>()` from `@ngrx/signals/entities`. Template control flow MUST use `@if`/`@for`
syntax — not `*ngIf`/`*ngFor` directives. Change detection strategy musy be `OnPush`

The following patterns are PROHIBITED:

- NgModules of any kind
- Classic NgRx (actions, reducers, effects)
- Class-based route guards
- Mixing Signal Store state with local component state for feature-level concerns

Each feature MUST have its own `store/` subfolder containing `*.store.ts` and `*.store.spec.ts`.
`DashboardStore` is the sole root-scoped store (`providedIn: 'root'`); all others are
feature-scoped.

**Rationale**: Standalone components and Signal Store represent the Angular 21 idiomatic
approach. Consistent patterns reduce cognitive overhead and enable tree-shaking.

### III. Test-First Development (NON-NEGOTIABLE)

Tests MUST be written before implementation code. The Red-Green-Refactor cycle is mandatory:
tests MUST fail before any implementation begins. No feature task is complete until its
associated tests exist and pass.

API coverage: xUnit unit tests with Moq, plus WebApplicationFactory integration tests against
the Cosmos Emulator for any repository or HTTP client code.
Client coverage: Jest + jest-preset-angular; stores tested via `TestBed.inject`.

**Rationale**: Retrofitting tests after the fact produces tests that verify implementation
details rather than behaviour. Test-first forces clear interface design before code is written.

### IV. Data Immutability

Transaction records are immutable in v1 — no update or delete operations MUST be implemented
or accepted. API endpoints and repository methods for transactions MUST be read/create only.
Any request to modify or delete a transaction MUST be rejected at the validation layer.

**Rationale**: Financial transaction ledgers are append-only by nature. Immutability simplifies
auditing, prevents accidental data loss, and defers complex reconciliation logic to a future
version when requirements are fully understood.

### V. Simplicity and YAGNI

Complexity MUST be justified by a current, concrete requirement — not a hypothetical future
need. Abstractions, helpers, and utilities MUST NOT be created for single-use scenarios. No
error handling, fallbacks, or validation MUST be added for scenarios that cannot currently
occur. Three similar lines of code are preferable to a premature abstraction.

External API rate limits (Finnhub: 60 req/min) MUST be respected at the infrastructure layer
through caching or throttling, not by pushing complexity into feature code.

**Rationale**: Speculative complexity is the primary source of maintenance burden. Adding
abstractions only when a second use case exists keeps the codebase lean and understandable.

## Technology Stack Constraints

The following stack is fixed for v1 and MUST NOT be substituted without a constitution amendment:

| Layer          | Technology                                                       |
| -------------- | ---------------------------------------------------------------- |
| API runtime    | C# / .NET 10, ASP.NET Core Web API                               |
| API patterns   | MediatR (CQRS), FluentValidation                                 |
| Client runtime | TypeScript / Angular 21                                          |
| Client UI      | Angular Material v3, ng2-charts + Chart.js                       |
| Client state   | @ngrx/signals v21 + @ngrx/signals/entities                       |
| Database       | Azure Cosmos DB NoSQL (containers: `watchlists`, `transactions`) |
| Local DB       | Docker Cosmos Emulator (port 8081)                               |
| Stock data     | Finnhub API (free tier, 60 req/min)                              |
| API tests      | xUnit, Moq, WebApplicationFactory                                |
| Client tests   | Jest, jest-preset-angular, Angular TestBed                       |

Container partition keys are fixed: `watchlists` → `/id`, `transactions` → `/watchlistId`.

## Development Workflow

1. **Specification first**: Every feature MUST have a `spec.md` before implementation begins.
2. **Plan before code**: A `plan.md` MUST exist and pass the Constitution Check before any
   task list is generated.
3. **Test before implement**: Per Principle III, tests MUST be written and confirmed failing
   before implementation tasks begin.
4. **Feature branch per feature**: All work for a feature MUST live on a dedicated branch
   named `###-feature-name` matching the feature folder name.
5. **PR to main**: Features are merged to `main` via pull request after tests pass.
6. **Cosmos Emulator required locally**: The Docker emulator MUST be running for integration
   tests. Tests against a mocked Cosmos client are insufficient for repository-layer coverage.

## Governance

This constitution supersedes all other development practices and style guides for the
stock-tracker project. When a practice documented elsewhere conflicts with a principle here,
the constitution prevails.

**Amendment procedure**:

1. Propose the amendment in a PR with a `docs:` commit updating this file.
2. Increment `CONSTITUTION_VERSION` per semantic versioning:
   - MAJOR: Principle removed, renamed, or made backward-incompatible.
   - MINOR: New principle or section added; material expansion of existing guidance.
   - PATCH: Clarification, wording improvement, or typo fix.
3. Update `LAST_AMENDED_DATE` to today's date (ISO 8601).
4. Propagate changes to affected templates (plan, spec, tasks) in the same PR.
5. PR description MUST include a Sync Impact Report listing all affected artifacts.

**Compliance**: All PR reviews MUST verify that the implementation does not violate any
principle. The Constitution Check section in `plan.md` is the enforcement gate — it MUST be
completed and passed before any implementation begins.

**Runtime guidance**: For day-to-day development commands and project structure, refer to
`CLAUDE.md` at the repository root.

**Version**: 1.0.0 | **Ratified**: 2026-04-03 | **Last Amended**: 2026-04-03
