using System.Net;
using System.Net.Http.Json;
using FluentAssertions;
using StockTracker.Api.Features.Holdings.AddHolding;
using StockTracker.Api.Features.Watchlists.GetWatchlist;

namespace StockTracker.IntegrationTests.Holdings;

public class AddHoldingIntegrationTests(StockTrackerApiFactory factory)
    : IClassFixture<StockTrackerApiFactory>
{
    private readonly HttpClient _client = factory.CreateClient();

    private async Task<WatchlistDetailDto> CreateWatchlistAsync()
    {
        var body = new { name = "Holdings Test List", description = "" };
        var response = await _client.PostAsJsonAsync("/api/watchlists", body);
        return (await response.Content.ReadFromJsonAsync<WatchlistDetailDto>())!;
    }

    [Fact]
    public async Task Post_WithNonExistentWatchlist_Returns404()
    {
        var body = new
        {
            stockSymbol = "AAPL",
            units = 10,
            pricePerUnit = 150.00,
            purchaseDate = "2026-01-01"
        };

        var response = await _client.PostAsJsonAsync("/api/watchlists/nonexistent-id/holdings", body);

        response.StatusCode.Should().Be(HttpStatusCode.NotFound);
    }

    [Fact]
    public async Task Post_WithZeroUnits_Returns400()
    {
        var watchlist = await CreateWatchlistAsync();
        var body = new
        {
            stockSymbol = "AAPL",
            units = 0,
            pricePerUnit = 150.00,
            purchaseDate = "2026-01-01"
        };

        var response = await _client.PostAsJsonAsync($"/api/watchlists/{watchlist.Id}/holdings", body);

        response.StatusCode.Should().Be(HttpStatusCode.BadRequest);
    }
}
