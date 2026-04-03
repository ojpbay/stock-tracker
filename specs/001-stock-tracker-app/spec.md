# Feature Specification: Stock Tracker Application

**Feature Branch**: `001-stock-tracker-app`
**Created**: 2026-03-27
**Status**: Draft
**Input**: User description: "I want to create a stock tracker application to provide the following features: stock lookup by name/symbol, watchlist management with purchase tracking, portfolio dashboards with P&L, and transaction management for buys, sells, and dividends."

## User Scenarios & Testing

### User Story 1 - Stock Search & Discovery (Priority: P1)

An investor wants to find a stock they are interested in. They type either a company name (e.g., "Apple") or a ticker symbol (e.g., "AAPL") into a search bar and are presented with matching results. Selecting a result shows high-level stock information including the current price, daily change, and other key metrics. From this view, they can choose to add the stock to one of their watchlists.

**Why this priority**: Without the ability to find and view stocks, no other feature in the application is accessible. This is the entry point for all investment tracking activity.

**Independent Test**: Can be fully tested by performing a stock search, viewing results, and confirming high-level stock details display correctly — delivers immediate value as a stock lookup tool even without watchlist functionality.

**Acceptance Scenarios**:

1. **Given** a user is on the search screen, **When** they enter a company name (e.g., "Microsoft"), **Then** matching stock results are shown including company name, ticker symbol, and exchange.
2. **Given** a user is on the search screen, **When** they enter a valid ticker symbol (e.g., "MSFT"), **Then** the exact matching stock is shown prominently at the top of results.
3. **Given** a user selects a stock from search results, **When** the stock detail view loads, **Then** they see current price, daily price change (absolute and percentage), and other key stock data.
4. **Given** a user views stock details, **When** they choose to add it to a watchlist, **Then** they are prompted to select or create a watchlist and enter purchase details.
5. **Given** a user enters a search term that matches nothing, **When** no results are found, **Then** a clear "no results found" message is displayed with a suggestion to try a different term.

---

### User Story 2 - Watchlist Creation & Stock Addition (Priority: P2)

An investor wants to organise their portfolio by creating named watchlists (e.g., "Tech Stocks", "Dividend Portfolio"). When adding a stock to a watchlist, they record the number of units purchased, the price paid per unit, and the date of purchase. They can also give the watchlist a name and optional description to keep things organised.

**Why this priority**: Watchlists are the core organisational unit of the application. All dashboard and P&L features depend on having stocks in a watchlist with purchase data.

**Independent Test**: Can be fully tested by creating a watchlist, adding stocks with purchase details, and verifying the data is saved and retrievable — delivers portfolio organisation value independently.

**Acceptance Scenarios**:

1. **Given** a user has no watchlists, **When** they create a new watchlist with a name, **Then** the watchlist is created and they are taken to the empty watchlist view.
2. **Given** a user is viewing stock details, **When** they add it to a watchlist and enter units (e.g., 10), purchase price (e.g., 150.00), and purchase date, **Then** the stock is added to the watchlist with those details recorded.
3. **Given** a user already has a watchlist, **When** they add a stock that is already in that watchlist, **Then** the purchase is recorded as an additional transaction and the holding is updated accordingly.
4. **Given** a user wants to manage a watchlist, **When** they edit the watchlist, **Then** they can update the name and add or modify the description, and changes are saved.
5. **Given** a user has a watchlist, **When** they view it, **Then** they see the watchlist name, description (if set), and all stocks currently held.
6. **Given** a user has opened a watchlist, **When** they click 'Add Holding', **Then** they are presented with a stock search interface where they can search by name or symbol, select a result, enter the number of units, purchase price per unit, and purchase date, and confirm to add the holding to that watchlist.

---

### User Story 3 - Portfolio Dashboard & P&L View (Priority: P3)

An investor opens one of their watchlists to review performance. The dashboard displays each held stock with its name, ticker symbol, number of units held, last purchase date, average purchase price, and a graphical indicator of profit or loss. A summary section shows the overall profit or loss for the entire watchlist.

**Why this priority**: This is the primary value-delivery view of the application — giving investors a clear, at-a-glance picture of how their portfolio is performing.

**Independent Test**: Can be fully tested with pre-populated watchlist data; verifying the dashboard displays all required columns and calculates P&L correctly delivers standalone reporting value.

**Acceptance Scenarios**:

1. **Given** a watchlist contains stocks, **When** the user opens the dashboard, **Then** each holding shows: stock name, symbol, units held, last purchase date, average purchase price, current price, and P&L value/percentage.
2. **Given** a holding has increased in value, **When** the P&L indicator is displayed, **Then** it is presented in a visually positive style (e.g., green colour, upward indicator).
3. **Given** a holding has decreased in value, **When** the P&L indicator is displayed, **Then** it is presented in a visually negative style (e.g., red colour, downward indicator).
4. **Given** the dashboard is loaded, **When** viewing the summary section, **Then** the total overall profit or loss for all holdings in the watchlist is displayed in monetary and percentage terms.
5. **Given** a user has multiple watchlists, **When** they navigate between them, **Then** each watchlist shows its own independent dashboard and summary.

---

### User Story 4 - Transaction Management: Additional Buys, Sales & Dividends (Priority: P4)

An investor wants to record ongoing activity against an existing holding: they bought more shares, received a dividend payment, or sold some or all of their position. The system updates the holding to reflect these transactions — adjusting unit count, recalculating average purchase price after buys, and recording income from dividends or sales.

**Why this priority**: Accurate portfolio tracking requires the ability to record ongoing activity. Without this, the P&L data becomes stale and unreliable over time.

**Independent Test**: Can be fully tested by recording buy, dividend, and sell transactions against a holding and verifying that units held, average purchase price, and income records are updated accurately.

**Acceptance Scenarios**:

1. **Given** a user holds a stock in a watchlist, **When** they record an additional purchase (units + price + date), **Then** the total units held increases and the average purchase price is recalculated across all buys.
2. **Given** a user holds a stock, **When** they record a dividend payment (amount + date), **Then** the income is recorded against that holding and reflected in overall watchlist performance.
3. **Given** a user holds 100 units of a stock, **When** they record a partial sale (e.g., 40 units at a given price and date), **Then** the units held decreases to 60 and the realised gain or loss is captured.
4. **Given** a user holds a stock, **When** they record a full sale of all remaining units, **Then** the holding is marked as closed and removed from the active holdings view, with full transaction history retained.
5. **Given** a user views transaction history for a holding, **When** they review it, **Then** all buys, sales, and dividends are listed chronologically with their dates, units, and amounts.

---

### Edge Cases

- What happens when a user searches for a stock that is suspended or delisted?
- How does the system handle a purchase date entered in the future?
- What happens if a user tries to sell more units than they currently hold?
- How does the system handle price data being temporarily unavailable — does it display the last known price with a staleness indicator, or block the view entirely?
- How are fractional share purchases handled (e.g., 0.5 units)?
- What happens when a user records a dividend for a stock they no longer hold (fully sold)?

## Requirements

### Functional Requirements

- **FR-001**: System MUST allow users to search for stocks by company name or ticker symbol and return matching results.
- **FR-002**: System MUST display high-level stock information for any selected stock, including current price, daily price change (absolute and percentage), and key market data.
- **FR-003**: Users MUST be able to create multiple named watchlists, each with an optional description.
- **FR-004**: Users MUST be able to add a stock to a watchlist, capturing number of units purchased, purchase price per unit, and purchase date.
- **FR-005**: System MUST display a dashboard for each watchlist showing: stock name, symbol, units held, last purchase date, average purchase price, current value, and profit or loss presented graphically.
- **FR-006**: System MUST display an overall profit or loss summary for each watchlist in both monetary and percentage terms.
- **FR-007**: Users MUST be able to edit a watchlist's name and description at any time.
- **FR-008**: System MUST allow users to record additional share purchases for an existing holding, automatically recalculating the weighted average purchase price.
- **FR-009**: System MUST allow users to record dividend income received for a held stock, capturing the amount and date.
- **FR-010**: System MUST allow users to record a partial or full sale of a held stock, capturing units sold, sale price per unit, and sale date.
- **FR-011**: System MUST prevent recording a sale of more units than are currently held and display a clear validation message.
- **FR-012**: System MUST maintain a full transaction history for each holding, listing all buys, sales, and dividends in chronological order.
- **FR-013**: System MUST update units held and dashboard P&L figures immediately after any transaction is recorded, without requiring a manual refresh.
- **FR-014**: System MUST support fractional unit quantities for purchases and sales.
- **FR-015**: Users MUST be able to add a holding directly from the watchlist view by clicking 'Add Holding', searching for a stock by name or symbol, entering purchase details (units, price per unit, date), and confirming — without navigating away from the watchlist.

### Key Entities

- **Stock**: Represents a publicly listed equity identified by a ticker symbol and company name; holds current market data (price, daily change) sourced externally.
- **Watchlist**: A user-defined collection of holdings with a name and optional description; provides an aggregated P&L summary across all holdings.
- **Holding**: The relationship between a Watchlist and a Stock; tracks total units currently held, weighted average purchase price, and last purchase date; values are derived from the associated transaction history.
- **Transaction**: A single recorded financial event against a holding — Buy (units + price per unit + date), Sell (units + price per unit + date), or Dividend (amount + date); forms the immutable ledger for each holding.

## Success Criteria

### Measurable Outcomes

- **SC-001**: Users can find any listed stock by name or symbol within 3 search interactions.
- **SC-002**: Watchlist dashboards display all holdings and P&L data within 3 seconds of opening.
- **SC-003**: Users can complete the full workflow of searching for a stock, adding it to a watchlist with purchase details, and viewing it in the dashboard in under 3 minutes on first use.
- **SC-004**: Profit and loss figures recalculate and display within 2 seconds of any transaction being recorded.
- **SC-005**: 100% of transaction types (buy, sell, dividend) are correctly reflected in holdings totals and watchlist summaries with no manual refresh required.
- **SC-006**: Users can record an additional transaction (buy, sell, or dividend) against an existing holding in under 1 minute.

## Assumptions

- Real-time or near-real-time stock price data is available via an external market data provider; the application will consume this data to display current prices and calculate unrealised P&L.
- The application is single-user for v1; there is no account sharing, collaboration, or multi-user requirement.
- All monetary values within a single watchlist are assumed to be in the same currency; multi-currency conversion across holdings is out of scope for v1.
- Stock search covers major global exchanges (e.g., NYSE, NASDAQ, LSE, ASX) subject to the capabilities of the external data provider used.
- Dividend reinvestment plans (DRIPs) are out of scope; dividends are recorded as cash income only and do not affect unit count.
- When a holding is fully sold, it remains visible in a closed positions or transaction history view rather than being permanently deleted.
- Fractional shares (e.g., 0.5 units) are supported to accommodate modern brokerage platforms.
- Average purchase price is calculated using the weighted average cost method across all buy transactions for a holding.
- If current price data is temporarily unavailable, the dashboard displays the last known price with a staleness indicator rather than blocking the view entirely.
- Users have a stable internet connection sufficient to retrieve live market data.
