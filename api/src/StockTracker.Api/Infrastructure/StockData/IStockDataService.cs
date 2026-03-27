namespace StockTracker.Api.Infrastructure.StockData;

public interface IStockDataService
{
    Task<IReadOnlyList<StockSearchResult>> SearchAsync(string query, CancellationToken cancellationToken = default);
    Task<StockQuote?> GetQuoteAsync(string symbol, CancellationToken cancellationToken = default);
}

public record StockSearchResult(string Symbol, string CompanyName, string Exchange, string Currency);

public record StockQuote(
    string Symbol,
    string CompanyName,
    string Exchange,
    string Currency,
    decimal CurrentPrice,
    decimal PriceChange,
    decimal PriceChangePercent,
    decimal MarketCap,
    decimal High52Week,
    decimal Low52Week,
    DateTimeOffset DataTimestamp);
