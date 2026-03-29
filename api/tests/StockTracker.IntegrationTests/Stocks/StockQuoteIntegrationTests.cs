using System.Net;
using System.Net.Http.Json;
using FluentAssertions;
using StockTracker.Api.Features.Stocks.GetQuote;

namespace StockTracker.IntegrationTests.Stocks;

public class StockQuoteIntegrationTests(StockTrackerApiFactory factory)
    : IClassFixture<StockTrackerApiFactory>
{
    private readonly HttpClient _client = factory.CreateClient();

    [Fact]
    public async Task GetQuote_UnknownSymbol_Returns404()
    {
        var response = await _client.GetAsync("/api/stocks/XYZNOTFOUND123");

        response.StatusCode.Should().Be(HttpStatusCode.NotFound);
    }

    [Fact]
    public async Task GetQuote_ValidSymbol_Returns200WithQuoteShape()
    {
        // Uses a well-known symbol that Finnhub will recognise
        var response = await _client.GetAsync("/api/stocks/AAPL");

        response.StatusCode.Should().Be(HttpStatusCode.OK);

        var result = await response.Content.ReadFromJsonAsync<GetStockQuoteResult>();
        result.Should().NotBeNull();
        result!.Symbol.Should().Be("AAPL");
        result.CurrentPrice.Should().BeGreaterThan(0);
    }
}
