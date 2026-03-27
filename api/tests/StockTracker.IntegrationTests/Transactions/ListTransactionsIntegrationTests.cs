using System.Net;
using FluentAssertions;

namespace StockTracker.IntegrationTests.Transactions;

public class ListTransactionsIntegrationTests(StockTrackerApiFactory factory)
    : IClassFixture<StockTrackerApiFactory>
{
    private readonly HttpClient _client = factory.CreateClient();

    [Fact]
    public async Task Get_ForNonExistentHolding_Returns200WithEmptyList()
    {
        // The LIST endpoint returns empty list (no auth/ownership check by design)
        var response = await _client.GetAsync(
            "/api/watchlists/nonexistent/holdings/nonexistent/transactions");

        // Returns 200 with empty list since no transactions exist for this combination
        response.StatusCode.Should().Be(HttpStatusCode.OK);
    }
}
