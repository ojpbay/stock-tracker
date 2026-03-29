namespace StockTracker.Api.Infrastructure.StockData;

public record FinnhubOptions
{
    public const string SectionName = "Finnhub";
    public string ApiKey { get; set; } = string.Empty;
    public string BaseUrl { get; set; } = string.Empty;
}
