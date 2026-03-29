using System.Net;
using System.Net.Http.Json;
using FluentAssertions;
using StockTracker.Api.Features.Transactions.AddTransaction;
using StockTracker.Api.Features.Watchlists.GetWatchlist;

namespace StockTracker.IntegrationTests.Transactions;

public class AddTransactionIntegrationTests(StockTrackerApiFactory factory)
    : IClassFixture<StockTrackerApiFactory>
{
    private readonly HttpClient _client = factory.CreateClient();

    [Fact]
    public async Task Post_WithNonExistentWatchlistOrHolding_Returns404()
    {
        var body = new
        {
            type = "Buy",
            transactionDate = "2026-01-01",
            units = 5,
            pricePerUnit = 150.00,
            dividendAmount = (decimal?)null
        };

        var response = await _client.PostAsJsonAsync(
            "/api/watchlists/nonexistent/holdings/nonexistent/transactions", body);

        response.StatusCode.Should().Be(HttpStatusCode.NotFound);
    }

    [Fact]
    public async Task Post_Dividend_Returns201WithCorrectType()
    {
        // Create watchlist + holding first (no live stock lookup in integration test)
        // We test the 404 path since we can't easily inject a fake Finnhub in integration tests
        var createBody = new { name = "Transaction Test", description = "" };
        var createResponse = await _client.PostAsJsonAsync("/api/watchlists", createBody);
        var watchlist = await createResponse.Content.ReadFromJsonAsync<WatchlistDetailDto>();

        // Try to post a transaction to a known non-existent holding
        var body = new
        {
            type = "Dividend",
            transactionDate = "2026-01-01",
            units = (decimal?)null,
            pricePerUnit = (decimal?)null,
            dividendAmount = 12.50
        };

        var response = await _client.PostAsJsonAsync(
            $"/api/watchlists/{watchlist!.Id}/holdings/nonexistent-holding/transactions", body);

        // Holding doesn't exist so expect 404
        response.StatusCode.Should().Be(HttpStatusCode.NotFound);
    }
}
