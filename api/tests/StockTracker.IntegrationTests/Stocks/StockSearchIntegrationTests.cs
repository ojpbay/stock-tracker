using System.Net;
using System.Net.Http.Json;
using FluentAssertions;
using StockTracker.Api.Features.Stocks.Search;

namespace StockTracker.IntegrationTests.Stocks;

public class StockSearchIntegrationTests(StockTrackerApiFactory factory)
    : IClassFixture<StockTrackerApiFactory>
{
    private readonly HttpClient _client = factory.CreateClient();

    [Fact]
    public async Task Search_MissingQueryParam_Returns400()
    {
        var response = await _client.GetAsync("/api/stocks/search");

        response.StatusCode.Should().Be(HttpStatusCode.BadRequest);
    }

    [Fact]
    public async Task Search_EmptyQueryParam_Returns400()
    {
        var response = await _client.GetAsync("/api/stocks/search?q=");

        response.StatusCode.Should().Be(HttpStatusCode.BadRequest);
    }

    [Fact]
    public async Task Search_ValidQuery_Returns200WithResultsArray()
    {
        var response = await _client.GetAsync("/api/stocks/search?q=Apple");

        response.StatusCode.Should().Be(HttpStatusCode.OK);

        var result = await response.Content.ReadFromJsonAsync<SearchStocksResult>();
        result.Should().NotBeNull();
        result!.Results.Should().NotBeNull();
    }
}
