namespace StockTracker.Api.Infrastructure.Cosmos;

public class CosmosDbOptions
{
    public const string SectionName = "CosmosDb";
    public string DatabaseName { get; set; } = "StockTrackerDb";
    public string WatchlistsContainerName { get; set; } = "watchlists";
    public string TransactionsContainerName { get; set; } = "transactions";
}
