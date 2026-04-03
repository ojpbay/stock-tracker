using Microsoft.Azure.Cosmos;
using Microsoft.Extensions.Options;
using StockTracker.Api.Domain;

namespace StockTracker.Api.Infrastructure.Cosmos;

public interface ITransactionRepository
{
    Task<Transaction> CreateAsync(Transaction transaction, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<Transaction>> GetByHoldingAsync(string watchlistId, string holdingId, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<Transaction>> GetByWatchlistAsync(string watchlistId, CancellationToken cancellationToken = default);
}

public class TransactionRepository(CosmosClient cosmosClient, IOptions<CosmosDbOptions> options) : ITransactionRepository
{
    private readonly CosmosDbOptions _options = options.Value;

    private Container Container =>
        cosmosClient.GetContainer(_options.DatabaseName, _options.TransactionsContainerName);

    public async Task<Transaction> CreateAsync(Transaction transaction, CancellationToken cancellationToken = default)
    {
        var response = await Container.CreateItemAsync(
            transaction,
            new PartitionKey(transaction.WatchlistId),
            cancellationToken: CancellationToken.None);
        return response.Resource;
    }

    public async Task<IReadOnlyList<Transaction>> GetByHoldingAsync(string watchlistId, string holdingId, CancellationToken cancellationToken = default)
    {
        var query = new QueryDefinition(
            "SELECT * FROM c WHERE c.watchlistId = @wId AND c.holdingId = @hId ORDER BY c.transactionDate DESC")
            .WithParameter("@wId", watchlistId)
            .WithParameter("@hId", holdingId);

        return await ExecuteQueryAsync(query, watchlistId, cancellationToken);
    }

    public async Task<IReadOnlyList<Transaction>> GetByWatchlistAsync(string watchlistId, CancellationToken cancellationToken = default)
    {
        var query = new QueryDefinition(
            "SELECT * FROM c WHERE c.watchlistId = @wId ORDER BY c.transactionDate DESC")
            .WithParameter("@wId", watchlistId);

        return await ExecuteQueryAsync(query, watchlistId, cancellationToken);
    }

    private async Task<IReadOnlyList<Transaction>> ExecuteQueryAsync(
        QueryDefinition query, string partitionKey, CancellationToken cancellationToken)
    {
        var results = new List<Transaction>();
        using var feed = Container.GetItemQueryIterator<Transaction>(
            query,
            requestOptions: new QueryRequestOptions { PartitionKey = new PartitionKey(partitionKey) });

        while (feed.HasMoreResults)
        {
            var batch = await feed.ReadNextAsync(cancellationToken);
            results.AddRange(batch);
        }

        return results;
    }
}
