# API Contract: Stock Tracker REST API

**Version**: v1
**Base URL (local)**: `http://localhost:5000/api`
**Base URL (production)**: TBD
**Format**: JSON (application/json)
**Authentication**: None (v1 — single-user personal application)

---

## Global Conventions

- All timestamps are ISO 8601 UTC strings: `"2026-03-27T10:00:00Z"`
- All dates (without time) are ISO 8601: `"2026-03-27"`
- All monetary amounts are decimal numbers with up to 10 decimal places
- All IDs are UUID v4 strings
- Successful creation returns `201 Created` with the created resource in the body
- Successful update returns `200 OK` with the updated resource in the body
- Successful delete returns `204 No Content`
- Not found returns `404 Not Found` with `{ "error": "string" }`
- Validation failure returns `400 Bad Request` with `{ "errors": { "fieldName": ["message"] } }`
- Server errors return `500 Internal Server Error` with `{ "error": "string" }`

---

## Stocks (External Data Proxy)

### Search Stocks

```
GET /api/stocks/search?q={query}
```

**Query params**:
| Param | Type | Required | Description |
|-------|------|----------|-------------|
| `q` | string | Yes | Company name or ticker symbol (min 1 character) |

**Response 200**:
```json
{
  "results": [
    {
      "symbol": "AAPL",
      "companyName": "Apple Inc.",
      "exchange": "NASDAQ",
      "currency": "USD"
    }
  ]
}
```

**Response 400**: `q` parameter missing or empty

---

### Get Stock Quote

```
GET /api/stocks/{symbol}
```

**Path params**:
| Param | Type | Description |
|-------|------|-------------|
| `symbol` | string | Uppercase ticker symbol, e.g. "AAPL" |

**Response 200**:
```json
{
  "symbol": "AAPL",
  "companyName": "Apple Inc.",
  "exchange": "NASDAQ",
  "currency": "USD",
  "currentPrice": 189.50,
  "priceChange": 2.30,
  "priceChangePercent": 1.23,
  "marketCap": 2950000000000,
  "high52Week": 199.62,
  "low52Week": 164.08,
  "dataTimestamp": "2026-03-27T15:30:00Z"
}
```

**Response 404**: Symbol not found or not supported by data provider

---

## Watchlists

### List Watchlists

```
GET /api/watchlists
```

**Response 200**:
```json
{
  "watchlists": [
    {
      "id": "uuid",
      "name": "Tech Stocks",
      "description": "My technology sector holdings",
      "holdingCount": 5,
      "createdAt": "2026-01-15T10:00:00Z",
      "updatedAt": "2026-03-20T14:30:00Z"
    }
  ]
}
```

---

### Create Watchlist

```
POST /api/watchlists
```

**Request body**:
```json
{
  "name": "Tech Stocks",
  "description": "My technology sector holdings"
}
```

| Field | Type | Required | Constraints |
|-------|------|----------|-------------|
| `name` | string | Yes | 1–100 characters |
| `description` | string | No | Max 500 characters |

**Response 201**: Full watchlist object (see Get Watchlist)

---

### Get Watchlist

```
GET /api/watchlists/{id}
```

**Response 200**:
```json
{
  "id": "uuid",
  "name": "Tech Stocks",
  "description": "My technology sector holdings",
  "createdAt": "2026-01-15T10:00:00Z",
  "updatedAt": "2026-03-20T14:30:00Z",
  "holdings": [
    {
      "holdingId": "uuid",
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

**Response 404**: Watchlist not found

---

### Update Watchlist

```
PUT /api/watchlists/{id}
```

**Request body**:
```json
{
  "name": "Tech & Growth Stocks",
  "description": "Updated description"
}
```

| Field | Type | Required | Constraints |
|-------|------|----------|-------------|
| `name` | string | Yes | 1–100 characters |
| `description` | string | No | Max 500 characters; omit to clear |

**Response 200**: Updated watchlist object

**Response 404**: Watchlist not found

---

### Delete Watchlist

```
DELETE /api/watchlists/{id}
```

**Response 204**: Deleted (also deletes all associated transactions)

**Response 404**: Watchlist not found

---

## Holdings

### Add Holding (Initial Buy)

```
POST /api/watchlists/{watchlistId}/holdings
```

**Path params**: `watchlistId` — UUID of the parent watchlist

**Request body**:
```json
{
  "stockSymbol": "AAPL",
  "units": 10.0,
  "pricePerUnit": 152.50,
  "transactionDate": "2026-02-10",
  "notes": "Initial purchase"
}
```

| Field | Type | Required | Constraints |
|-------|------|----------|-------------|
| `stockSymbol` | string | Yes | Valid ticker; looked up via stock provider |
| `units` | decimal | Yes | > 0; supports fractional |
| `pricePerUnit` | decimal | Yes | > 0 |
| `transactionDate` | ISO 8601 date | Yes | Not in the future |
| `notes` | string | No | Max 250 characters |

**Response 201**:
```json
{
  "holdingId": "uuid",
  "stockSymbol": "AAPL",
  "companyName": "Apple Inc.",
  "exchange": "NASDAQ",
  "totalUnits": 10.0,
  "averagePurchasePrice": 152.50,
  "lastPurchaseDate": "2026-02-10",
  "status": "active",
  "transactionId": "uuid"
}
```

**Response 400**: Validation error (symbol not found, negative units, future date)

**Response 404**: Watchlist not found

**Note**: If the stock symbol already exists in this watchlist, the buy is added as a transaction against the existing holding — the holding is not duplicated.

---

## Transactions

### Add Transaction

```
POST /api/watchlists/{watchlistId}/holdings/{holdingId}/transactions
```

**Path params**:
| Param | Description |
|-------|-------------|
| `watchlistId` | UUID of the parent watchlist |
| `holdingId` | UUID of the holding |

**Request body — Buy**:
```json
{
  "type": "Buy",
  "units": 5.0,
  "pricePerUnit": 160.00,
  "transactionDate": "2026-03-15",
  "notes": "DCA purchase"
}
```

**Request body — Sell**:
```json
{
  "type": "Sell",
  "units": 3.0,
  "pricePerUnit": 175.00,
  "transactionDate": "2026-03-20",
  "notes": "Partial profit taking"
}
```

**Request body — Dividend**:
```json
{
  "type": "Dividend",
  "amount": 12.50,
  "transactionDate": "2026-03-01",
  "notes": "Q1 2026 dividend"
}
```

| Field | Type | Required | Constraints |
|-------|------|----------|-------------|
| `type` | enum | Yes | `"Buy"` \| `"Sell"` \| `"Dividend"` |
| `units` | decimal | Buy/Sell | > 0 for Buy; > 0 and ≤ current totalUnits for Sell |
| `pricePerUnit` | decimal | Buy/Sell | > 0 |
| `amount` | decimal | Dividend | > 0 |
| `transactionDate` | ISO 8601 date | Yes | Not in the future |
| `notes` | string | No | Max 250 characters |

**Response 201**:
```json
{
  "transactionId": "uuid",
  "holdingId": "uuid",
  "type": "Buy",
  "units": 5.0,
  "pricePerUnit": 160.00,
  "transactionDate": "2026-03-15",
  "createdAt": "2026-03-15T09:00:00Z",
  "updatedHolding": {
    "totalUnits": 15.0,
    "averagePurchasePrice": 154.83,
    "lastPurchaseDate": "2026-03-15",
    "status": "active"
  }
}
```

**Response 400**:
- Sell units exceed current holdings
- Future transaction date
- Invalid type/field combination

**Response 404**: Watchlist or holding not found

---

### List Transactions

```
GET /api/watchlists/{watchlistId}/holdings/{holdingId}/transactions
```

**Query params**:
| Param | Type | Required | Description |
|-------|------|----------|-------------|
| `type` | string | No | Filter by type: `Buy`, `Sell`, `Dividend` |
| `from` | ISO 8601 date | No | Start date (inclusive) |
| `to` | ISO 8601 date | No | End date (inclusive) |

**Response 200**:
```json
{
  "transactions": [
    {
      "transactionId": "uuid",
      "type": "Buy",
      "units": 10.0,
      "pricePerUnit": 152.50,
      "amount": null,
      "transactionDate": "2026-02-10",
      "notes": "Initial purchase",
      "createdAt": "2026-02-10T09:15:00Z"
    }
  ]
}
```

---

## Dashboard

### Get Watchlist Dashboard

```
GET /api/watchlists/{id}/dashboard
```

**Description**: Returns the full dashboard data for a watchlist including live prices and computed P&L for all active holdings. Calls the stock data provider for current prices.

**Response 200**:
```json
{
  "watchlistId": "uuid",
  "watchlistName": "Tech Stocks",
  "summary": {
    "totalInvested": 15234.50,
    "currentValue": 17890.00,
    "unrealisedPnL": 2655.50,
    "unrealisedPnLPercent": 17.43,
    "realisedPnL": 430.00,
    "dividendIncome": 87.50,
    "totalPnL": 3173.00,
    "totalPnLPercent": 20.83
  },
  "holdings": [
    {
      "holdingId": "uuid",
      "stockSymbol": "AAPL",
      "companyName": "Apple Inc.",
      "exchange": "NASDAQ",
      "currency": "USD",
      "totalUnits": 25.5,
      "averagePurchasePrice": 148.72,
      "lastPurchaseDate": "2026-02-10",
      "currentPrice": 189.50,
      "currentValue": 4832.25,
      "unrealisedPnL": 1040.19,
      "unrealisedPnLPercent": 27.27,
      "realisedPnL": 0.00,
      "dividendIncome": 45.00,
      "totalPnL": 1085.19,
      "status": "active",
      "priceDataFresh": true,
      "priceDataTimestamp": "2026-03-27T15:30:00Z"
    }
  ],
  "pricesRefreshedAt": "2026-03-27T15:30:00Z"
}
```

**Notes**:
- `priceDataFresh: false` when the data provider returned stale or unavailable data; last known price is used
- Closed holdings (status: `"closed"`) are excluded from `currentValue` and `unrealisedPnL` but included in `realisedPnL` and `dividendIncome` totals

**Response 404**: Watchlist not found

---

## Error Response Schema

```json
{
  "error": "Human-readable error message",
  "code": "MACHINE_READABLE_CODE",
  "details": {}
}
```

**Common error codes**:
| Code | Meaning |
|------|---------|
| `WATCHLIST_NOT_FOUND` | Watchlist ID does not exist |
| `HOLDING_NOT_FOUND` | Holding ID not found in watchlist |
| `SYMBOL_NOT_FOUND` | Stock symbol not recognised by data provider |
| `INSUFFICIENT_UNITS` | Sell would exceed current holdings |
| `FUTURE_DATE` | Transaction date is in the future |
| `VALIDATION_ERROR` | Request body fails validation |
| `PRICE_DATA_UNAVAILABLE` | External data provider unreachable |
