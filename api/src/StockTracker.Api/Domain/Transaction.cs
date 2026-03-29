namespace StockTracker.Api.Domain;

public enum TransactionType { Buy, Sell, Dividend }

public class Transaction
{
    public string TransactionId { get; init; } = Guid.NewGuid().ToString();
    public string WatchlistId { get; init; } = string.Empty;
    public string HoldingId { get; init; } = string.Empty;
    public string StockSymbol { get; init; } = string.Empty;
    public TransactionType Type { get; init; }
    public DateOnly TransactionDate { get; init; }
    public decimal? Units { get; init; }
    public decimal? PricePerUnit { get; init; }
    public decimal? DividendAmount { get; init; }
    public DateTimeOffset CreatedAt { get; init; } = DateTimeOffset.UtcNow;

    // Partition key for Cosmos container
    public string WatchlistIdPartitionKey => WatchlistId;

    public static Transaction CreateBuy(
        string watchlistId, string holdingId, string stockSymbol,
        decimal units, decimal pricePerUnit, DateOnly date) =>
        new()
        {
            WatchlistId = watchlistId,
            HoldingId = holdingId,
            StockSymbol = stockSymbol,
            Type = TransactionType.Buy,
            TransactionDate = date,
            Units = units,
            PricePerUnit = pricePerUnit,
        };

    public static Transaction CreateSell(
        string watchlistId, string holdingId, string stockSymbol,
        decimal units, decimal pricePerUnit, DateOnly date) =>
        new()
        {
            WatchlistId = watchlistId,
            HoldingId = holdingId,
            StockSymbol = stockSymbol,
            Type = TransactionType.Sell,
            TransactionDate = date,
            Units = units,
            PricePerUnit = pricePerUnit,
        };

    public static Transaction CreateDividend(
        string watchlistId, string holdingId, string stockSymbol,
        decimal amount, DateOnly date) =>
        new()
        {
            WatchlistId = watchlistId,
            HoldingId = holdingId,
            StockSymbol = stockSymbol,
            Type = TransactionType.Dividend,
            TransactionDate = date,
            DividendAmount = amount,
        };
}
