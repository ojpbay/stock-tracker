namespace StockTracker.Api.Domain;

public enum HoldingStatus { Active, Closed }

public record HoldingSummary(
    string HoldingId,
    string StockSymbol,
    string CompanyName,
    string Exchange,
    decimal TotalUnits,
    decimal AveragePurchasePrice,
    DateOnly LastPurchaseDate,
    HoldingStatus Status);
