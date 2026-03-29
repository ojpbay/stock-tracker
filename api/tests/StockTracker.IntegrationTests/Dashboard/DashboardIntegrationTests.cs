using System.Net;
using System.Net.Http.Json;
using FluentAssertions;
using StockTracker.Api.Features.Dashboard.GetDashboard;
using StockTracker.Api.Features.Watchlists.GetWatchlist;

namespace StockTracker.IntegrationTests.Dashboard;

public class DashboardIntegrationTests(StockTrackerApiFactory factory)
    : IClassFixture<StockTrackerApiFactory>
{
    private readonly HttpClient _client = factory.CreateClient();

    [Fact]
    public async Task GetDashboard_UnknownWatchlist_Returns404()
    {
        var response = await _client.GetAsync("/api/watchlists/unknown-id/dashboard");

        response.StatusCode.Should().Be(HttpStatusCode.NotFound);
    }

    [Fact]
    public async Task GetDashboard_EmptyWatchlist_ReturnsStructureWithNoHoldings()
    {
        // Create an empty watchlist
        var createBody = new { name = "Dashboard Test", description = "" };
        var createResponse = await _client.PostAsJsonAsync("/api/watchlists", createBody);
        var created = await createResponse.Content.ReadFromJsonAsync<WatchlistDetailDto>();

        var response = await _client.GetAsync($"/api/watchlists/{created!.Id}/dashboard");

        response.StatusCode.Should().Be(HttpStatusCode.OK);
        var result = await response.Content.ReadFromJsonAsync<DashboardResponseDto>();
        result.Should().NotBeNull();
        result!.WatchlistId.Should().Be(created.Id);
        result.Holdings.Should().BeEmpty();
        result.Summary.TotalCost.Should().Be(0);
    }
}
