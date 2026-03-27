# Data Model: Stock Tracker Application

**Phase**: 1 — Design
**Date**: 2026-03-27
**Branch**: `001-stock-tracker-app`
**Storage**: Azure Cosmos DB NoSQL (two containers: `watchlists`, `transactions`)

---

## Entities

### 1. Watchlist

**Container**: `watchlists`
**Partition key**: `/id`
**Description**: A user-defined collection of stock holdings. Each watchlist has a name and optional description. The holdings array embeds a summary of each held stock position.

```json
{
  "id": "uuid-v4",
  "name": "Tech Stocks",
  "description": "My technology sector holdings",
  "createdAt": "2026-01-15T10:00:00Z",
  "updatedAt": "2026-03-20T14:30:00Z",
  "holdings": [
    {
      "holdingId": "uuid-v4",
      "stockSymbol": "AAPL",
      "companyName": "Apple Inc.",
      "exchange": "NASDAQ",
      "totalUnits": 25.5,
      "averagePurchasePrice": 148.72,
      "lastPurchaseDate": "2026-02-10",
      "status": "active"
    }
  ]
}
```

**Fields**:

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `id` | string (UUID) | Yes | Cosmos document id + partition key |
| `name` | string | Yes | 1–100 characters |
| `description` | string | No | Up to 500 characters |
| `createdAt` | ISO 8601 datetime | Yes | Set on creation, never updated |
| `updatedAt` | ISO 8601 datetime | Yes | Updated on any mutation |
| `holdings[]` | array | Yes | Empty array when no holdings |
| `holdings[].holdingId` | string (UUID) | Yes | Stable identifier for this holding |
| `holdings[].stockSymbol` | string | Yes | Uppercase ticker, e.g. "AAPL" |
| `holdings[].companyName` | string | Yes | Denormalized from stock data provider at time of add |
| `holdings[].exchange` | string | Yes | e.g. "NASDAQ", "NYSE", "LSE" |
| `holdings[].totalUnits` | decimal | Yes | Computed: sum(buy units) − sum(sell units). Supports fractional. |
| `holdings[].averagePurchasePrice` | decimal | Yes | Computed: weighted average cost across all buy transactions |
| `holdings[].lastPurchaseDate` | ISO 8601 date | Yes | Date of the most recent buy transaction |
| `holdings[].status` | enum | Yes | `"active"` (units > 0) or `"closed"` (fully sold) |

**Validation rules**:
- `name` must be unique per user (enforced at application layer)
- `holdings[].totalUnits` must never be negative (enforced before recording sell transactions)
- `holdings[].averagePurchasePrice` must be recalculated after every buy transaction

---

### 2. Transaction

**Container**: `transactions`
**Partition key**: `/watchlistId`
**Description**: An immutable record of a single financial event against a holding. Transactions are the source of truth from which `totalUnits` and `averagePurchasePrice` are derived. Three types: `Buy`, `Sell`, `Dividend`.

```json
{
  "id": "uuid-v4",
  "watchlistId": "uuid-v4",
  "holdingId": "uuid-v4",
  "stockSymbol": "AAPL",
  "type": "Buy",
  "units": 10.0,
  "pricePerUnit": 152.50,
  "amount": null,
  "transactionDate": "2026-02-10",
  "notes": "Regular monthly DCA purchase",
  "createdAt": "2026-02-10T09:15:00Z"
}
```

**Fields**:

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `id` | string (UUID) | Yes | Cosmos document id |
| `watchlistId` | string (UUID) | Yes | Partition key; links to parent watchlist |
| `holdingId` | string (UUID) | Yes | Links to holding within the watchlist |
| `stockSymbol` | string | Yes | Denormalized for query convenience |
| `type` | enum | Yes | `"Buy"` \| `"Sell"` \| `"Dividend"` |
| `units` | decimal | Conditional | Required for `Buy` and `Sell`; null for `Dividend` |
| `pricePerUnit` | decimal | Conditional | Required for `Buy` and `Sell`; null for `Dividend` |
| `amount` | decimal | Conditional | Required for `Dividend` (total cash received); null for `Buy`/`Sell` |
| `transactionDate` | ISO 8601 date | Yes | Date the transaction occurred (user-provided, not system timestamp) |
| `notes` | string | No | Optional free-text note, up to 250 characters |
| `createdAt` | ISO 8601 datetime | Yes | System timestamp when record was created |

**Validation rules**:
- `units` must be > 0 for `Buy` and `Sell`
- `pricePerUnit` must be > 0 for `Buy` and `Sell`
- `amount` must be > 0 for `Dividend`
- `transactionDate` must not be in the future
- For `Sell` transactions: `units` must not exceed the current `holdings[].totalUnits` for that holding
- Transactions are **immutable** once created (no update/delete in v1)

---

### 3. Stock (External — Read-only)

**Source**: Finnhub API (not stored in Cosmos DB)
**Description**: Real-time stock data fetched on demand from the external data provider. Not persisted locally. Company name and exchange are cached in the `Watchlist.holdings[]` array at the time of first add to avoid dependency on the external API for historical display.

**Fields used from provider**:

| Field | Notes |
|-------|-------|
| `symbol` | Ticker symbol, e.g. "AAPL" |
| `companyName` | Full company name, e.g. "Apple Inc." |
| `exchange` | Exchange name, e.g. "NASDAQ" |
| `currentPrice` | Latest trade price |
| `priceChange` | Absolute daily change |
| `priceChangePercent` | Percentage daily change |
| `marketCap` | Market capitalisation |
| `currency` | Currency of the price, e.g. "USD" |

---

## Derived / Computed Values

These values are **not stored** as independent fields — they are computed at query/display time from transaction data and current stock prices:

| Derived Value | Formula | Where Computed |
|---------------|---------|----------------|
| `totalUnits` | `SUM(buy.units) − SUM(sell.units)` | API layer when processing transactions; cached in holding summary |
| `averagePurchasePrice` | `SUM(buy.units × buy.pricePerUnit) / SUM(buy.units)` | API layer; cached in holding summary |
| `currentValue` | `totalUnits × currentPrice` | API layer (requires live price from Finnhub) |
| `unrealisedPnL` | `currentValue − (totalUnits × averagePurchasePrice)` | API layer |
| `unrealisedPnLPercent` | `(unrealisedPnL / (totalUnits × averagePurchasePrice)) × 100` | API layer |
| `realisedPnL` | `SUM(sell.units × sell.pricePerUnit) − SUM(sell.units × weightedAvgCostAtSell)` | API layer (requires cost-basis tracking) |
| `dividendIncome` | `SUM(dividend.amount)` | API layer |
| `totalPnL` | `unrealisedPnL + realisedPnL + dividendIncome` | API layer |
| `watchlistTotalValue` | `SUM(holding.currentValue)` for all active holdings | API layer |
| `watchlistTotalPnL` | `SUM(holding.totalPnL)` for all holdings | API layer |

---

## Entity Relationships

```
Watchlist (1) ──── (many) Holding  [embedded in watchlist document]
Holding   (1) ──── (many) Transaction  [separate container, partitioned by watchlistId]
Stock          ──── (external, read-only, referenced by symbol)
```

---

## State Transitions

### Holding Status

```
[No holding] ──(first Buy transaction)──► active
   active    ──(Sell all units)         ──► closed
   closed    ──(Buy more)               ──► active
```

### Transaction Lifecycle

Transactions are **append-only / immutable** in v1. There is no edit or delete. This preserves audit trail integrity.

---

## Indexing Strategy (Cosmos DB)

**`watchlists` container**:
- Default indexing on all paths (Cosmos default) is sufficient
- No cross-document queries needed (each watchlist is self-contained)

**`transactions` container**:
- Partition key `/watchlistId` ensures all transactions for a watchlist are co-located
- Range index on `/holdingId` for filtering by holding within a watchlist partition
- Range index on `/transactionDate` for chronological ordering
- Range index on `/type` for filtering by transaction type

---

## Data Volume Assumptions

- Single user, single-currency environment
- Typical watchlist: 5–30 holdings
- Typical holding: 10–500 transactions over its lifetime
- Expected total transaction count: < 10,000 (well within Cosmos free tier / emulator limits)
