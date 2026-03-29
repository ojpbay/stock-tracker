using System.Text.Json;
using System.Text.Json.Serialization;

namespace StockTracker.Api.Infrastructure.StockData;

/// <summary>
/// HTTP client for the Finnhub stock data API.
/// Full implementation completed in US1 (T029).
/// </summary>
public class FinnhubClient(HttpClient httpClient) : IStockDataService
{
    private static readonly JsonSerializerOptions JsonOptions = new()
    {
        PropertyNameCaseInsensitive = true
    };

    public async Task<IReadOnlyList<StockSearchResult>> SearchAsync(
        string query,
        CancellationToken cancellationToken = default)
    {
        var response = await httpClient.GetAsync(
            $"search?q={Uri.EscapeDataString(query)}", cancellationToken);

        response.EnsureSuccessStatusCode();

        var json = await response.Content.ReadAsStringAsync(cancellationToken);
        var result = JsonSerializer.Deserialize<FinnhubSearchResponse>(json, JsonOptions);

        return result?.Result
            .Where(r => !string.IsNullOrEmpty(r.Symbol))
            .Select(r => new StockSearchResult(
                Symbol: r.Symbol,
                CompanyName: r.Description,
                Exchange: "N/A",
                Currency: "USD"))
            .ToList() ?? [];
    }

    public async Task<StockQuote?> GetQuoteAsync(
        string symbol,
        CancellationToken cancellationToken = default)
    {
        // Fetch quote and profile in parallel
        var quoteTask = httpClient.GetAsync($"quote?symbol={Uri.EscapeDataString(symbol)}", cancellationToken);
        var profileTask = httpClient.GetAsync($"stock/profile2?symbol={Uri.EscapeDataString(symbol)}", cancellationToken);

        await Task.WhenAll(quoteTask, profileTask);

        var quoteResponse = await quoteTask;
        var profileResponse = await profileTask;

        if (!quoteResponse.IsSuccessStatusCode) return null;

        var quoteJson = await quoteResponse.Content.ReadAsStringAsync(cancellationToken);
        var profileJson = await profileResponse.Content.ReadAsStringAsync(cancellationToken);

        var q = JsonSerializer.Deserialize<FinnhubQuote>(quoteJson, JsonOptions);
        var p = JsonSerializer.Deserialize<FinnhubProfile>(profileJson, JsonOptions);

        if (q is null || q.C == 0) return null;

        return new StockQuote(
            Symbol: symbol.ToUpperInvariant(),
            CompanyName: p?.Name ?? symbol,
            Exchange: p?.Exchange ?? "N/A",
            Currency: p?.Currency ?? "USD",
            CurrentPrice: q.C,
            PriceChange: q.D,
            PriceChangePercent: q.Dp,
            MarketCap: p?.MarketCapitalization ?? 0,
            High52Week: q.H,
            Low52Week: q.L,
            DataTimestamp: DateTimeOffset.UtcNow);
    }

    private sealed record FinnhubSearchResponse(
        [property: JsonPropertyName("result")] List<FinnhubSearchItem> Result);

    private sealed record FinnhubSearchItem(
        [property: JsonPropertyName("symbol")] string Symbol,
        [property: JsonPropertyName("description")] string Description);

    private sealed record FinnhubQuote(
        [property: JsonPropertyName("c")] decimal C,
        [property: JsonPropertyName("d")] decimal D,
        [property: JsonPropertyName("dp")] decimal Dp,
        [property: JsonPropertyName("h")] decimal H,
        [property: JsonPropertyName("l")] decimal L);

    private sealed record FinnhubProfile(
        [property: JsonPropertyName("name")] string? Name,
        [property: JsonPropertyName("exchange")] string? Exchange,
        [property: JsonPropertyName("currency")] string? Currency,
        [property: JsonPropertyName("marketCapitalization")] decimal MarketCapitalization);
}
