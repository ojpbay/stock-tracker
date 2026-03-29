using System.Net;
using System.Net.Http.Json;
using FluentAssertions;
using StockTracker.Api.Features.Watchlists.CreateWatchlist;
using StockTracker.Api.Features.Watchlists.GetWatchlist;
using StockTracker.Api.Features.Watchlists.ListWatchlists;

namespace StockTracker.IntegrationTests.Watchlists;

public class WatchlistCrudIntegrationTests(StockTrackerApiFactory factory)
    : IClassFixture<StockTrackerApiFactory>
{
    private readonly HttpClient _client = factory.CreateClient();

    [Fact]
    public async Task Post_WithValidBody_Returns201WithCreatedWatchlist()
    {
        var body = new { name = "Tech Stocks", description = "My tech holdings" };

        var response = await _client.PostAsJsonAsync("/api/watchlists", body);

        response.StatusCode.Should().Be(HttpStatusCode.Created);
        var result = await response.Content.ReadFromJsonAsync<WatchlistDetailDto>();
        result.Should().NotBeNull();
        result!.Name.Should().Be("Tech Stocks");
        result.Id.Should().NotBeNullOrEmpty();
    }

    [Fact]
    public async Task Post_WithMissingName_Returns400()
    {
        var body = new { name = "", description = "" };

        var response = await _client.PostAsJsonAsync("/api/watchlists", body);

        response.StatusCode.Should().Be(HttpStatusCode.BadRequest);
    }

    [Fact]
    public async Task GetAll_ReturnsListWithCreatedWatchlist()
    {
        // Create a watchlist first
        var body = new { name = "Integration Test List", description = "" };
        await _client.PostAsJsonAsync("/api/watchlists", body);

        var response = await _client.GetAsync("/api/watchlists");

        response.StatusCode.Should().Be(HttpStatusCode.OK);
        var result = await response.Content.ReadFromJsonAsync<ListWatchlistsResult>();
        result.Should().NotBeNull();
        result!.Watchlists.Should().NotBeEmpty();
    }

    [Fact]
    public async Task GetById_AfterCreate_Returns200WithSameId()
    {
        // Create
        var body = new { name = "Get By Id Test", description = "" };
        var createResponse = await _client.PostAsJsonAsync("/api/watchlists", body);
        var created = await createResponse.Content.ReadFromJsonAsync<WatchlistDetailDto>();

        // Get
        var response = await _client.GetAsync($"/api/watchlists/{created!.Id}");

        response.StatusCode.Should().Be(HttpStatusCode.OK);
        var result = await response.Content.ReadFromJsonAsync<WatchlistDetailDto>();
        result!.Id.Should().Be(created.Id);
    }

    [Fact]
    public async Task GetById_WithUnknownId_Returns404()
    {
        var response = await _client.GetAsync("/api/watchlists/nonexistent-id");

        response.StatusCode.Should().Be(HttpStatusCode.NotFound);
    }

    [Fact]
    public async Task Put_UpdatesNameAndDescription()
    {
        // Create
        var body = new { name = "Original Name", description = "" };
        var createResponse = await _client.PostAsJsonAsync("/api/watchlists", body);
        var created = await createResponse.Content.ReadFromJsonAsync<WatchlistDetailDto>();

        // Update
        var updateBody = new { name = "Updated Name", description = "New description" };
        var response = await _client.PutAsJsonAsync($"/api/watchlists/{created!.Id}", updateBody);

        response.StatusCode.Should().Be(HttpStatusCode.OK);
        var result = await response.Content.ReadFromJsonAsync<WatchlistDetailDto>();
        result!.Name.Should().Be("Updated Name");
    }

    [Fact]
    public async Task Delete_RemovesWatchlist()
    {
        // Create
        var body = new { name = "To Delete", description = "" };
        var createResponse = await _client.PostAsJsonAsync("/api/watchlists", body);
        var created = await createResponse.Content.ReadFromJsonAsync<WatchlistDetailDto>();

        // Delete
        var deleteResponse = await _client.DeleteAsync($"/api/watchlists/{created!.Id}");
        deleteResponse.StatusCode.Should().Be(HttpStatusCode.NoContent);

        // Verify gone
        var getResponse = await _client.GetAsync($"/api/watchlists/{created.Id}");
        getResponse.StatusCode.Should().Be(HttpStatusCode.NotFound);
    }
}
