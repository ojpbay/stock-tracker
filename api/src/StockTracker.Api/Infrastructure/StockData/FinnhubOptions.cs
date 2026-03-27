namespace StockTracker.Api.Infrastructure.StockData;

public class FinnhubOptions
{
    public const string SectionName = "Finnhub";
    public string ApiKey { get; set; } = string.Empty;
    public string BaseUrl { get; set; } = "https://finnhub.io/api/v1/";
}
