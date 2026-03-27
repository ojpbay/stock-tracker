using System.Text.Json;
using Microsoft.Extensions.Options;

namespace StockTracker.Api.Infrastructure.StockData;

/// <summary>
/// HTTP client for the Finnhub stock data API.
/// Full implementation completed in US1 (T029).
/// </summary>
public class FinnhubClient(HttpClient httpClient, IOptions<FinnhubOptions> options) : IStockDataService
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
        using var doc = JsonDocument.Parse(json);

        if (!doc.RootElement.TryGetProperty("result", out var results))
            return [];

        return results.EnumerateArray()
            .Select(r => new StockSearchResult(
                Symbol: r.GetProperty("symbol").GetString() ?? string.Empty,
                CompanyName: r.GetProperty("description").GetString() ?? string.Empty,
                Exchange: r.TryGetProperty("displaySymbol", out _) ? "N/A" : "N/A",
                Currency: "USD"))
            .Where(r => !string.IsNullOrEmpty(r.Symbol))
            .ToList();
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

        using var quoteDoc = JsonDocument.Parse(quoteJson);
        using var profileDoc = JsonDocument.Parse(profileJson);

        var q = quoteDoc.RootElement;
        var p = profileDoc.RootElement;

        if (!q.TryGetProperty("c", out var currentPriceProp) || currentPriceProp.GetDecimal() == 0)
            return null;

        return new StockQuote(
            Symbol: symbol.ToUpperInvariant(),
            CompanyName: p.TryGetProperty("name", out var name) ? name.GetString() ?? symbol : symbol,
            Exchange: p.TryGetProperty("exchange", out var ex) ? ex.GetString() ?? "N/A" : "N/A",
            Currency: p.TryGetProperty("currency", out var curr) ? curr.GetString() ?? "USD" : "USD",
            CurrentPrice: currentPriceProp.GetDecimal(),
            PriceChange: q.TryGetProperty("d", out var d) ? d.GetDecimal() : 0,
            PriceChangePercent: q.TryGetProperty("dp", out var dp) ? dp.GetDecimal() : 0,
            MarketCap: p.TryGetProperty("marketCapitalization", out var mc) ? mc.GetDecimal() : 0,
            High52Week: q.TryGetProperty("h", out var h52) ? h52.GetDecimal() : 0,
            Low52Week: q.TryGetProperty("l", out var l52) ? l52.GetDecimal() : 0,
            DataTimestamp: DateTimeOffset.UtcNow);
    }
}
