using Microsoft.Azure.Cosmos;

namespace StockTracker.Api.Infrastructure.Cosmos;

public class CosmosDbInitialiser(CosmosClient client, IConfiguration configuration, ILogger<CosmosDbInitialiser> logger)
{
    public async Task InitialiseAsync()
    {
        var databaseName = configuration["CosmosDb:DatabaseName"] ?? "StockTrackerDb";
        var watchlistsContainer = configuration["CosmosDb:WatchlistsContainerName"] ?? "watchlists";
        var transactionsContainer = configuration["CosmosDb:TransactionsContainerName"] ?? "transactions";

        logger.LogInformation("Initialising Cosmos DB database '{Database}'", databaseName);

        var database = await client.CreateDatabaseIfNotExistsAsync(databaseName);

        await database.Database.CreateContainerIfNotExistsAsync(new ContainerProperties
        {
            Id = watchlistsContainer,
            PartitionKeyPath = "/id"
        });

        await database.Database.CreateContainerIfNotExistsAsync(new ContainerProperties
        {
            Id = transactionsContainer,
            PartitionKeyPath = "/watchlistId"
        });

        logger.LogInformation("Cosmos DB initialised successfully");
    }
}
