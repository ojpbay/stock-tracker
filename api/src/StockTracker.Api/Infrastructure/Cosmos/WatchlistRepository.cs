using Microsoft.Azure.Cosmos;
using Microsoft.Extensions.Options;
using StockTracker.Api.Domain;

namespace StockTracker.Api.Infrastructure.Cosmos;

public interface IWatchlistRepository
{
    Task<IReadOnlyList<Watchlist>> GetAllAsync(CancellationToken cancellationToken = default);
    Task<Watchlist?> GetByIdAsync(string id, CancellationToken cancellationToken = default);
    Task<Watchlist> CreateAsync(Watchlist watchlist, CancellationToken cancellationToken = default);
    Task<Watchlist> UpdateAsync(Watchlist watchlist, CancellationToken cancellationToken = default);
    Task DeleteAsync(string id, CancellationToken cancellationToken = default);
}

public class WatchlistRepository(CosmosClient cosmosClient, IOptions<CosmosDbOptions> options) : IWatchlistRepository
{
    private readonly CosmosDbOptions _options = options.Value;

    private Container Container =>
        cosmosClient.GetContainer(_options.DatabaseName, _options.WatchlistsContainerName);

    public async Task<IReadOnlyList<Watchlist>> GetAllAsync(CancellationToken cancellationToken = default)
    {
        var query = new QueryDefinition("SELECT * FROM c");
        var results = new List<Watchlist>();

        using var feed = Container.GetItemQueryIterator<Watchlist>(query);
        while (feed.HasMoreResults)
        {
            var batch = await feed.ReadNextAsync(cancellationToken);
            results.AddRange(batch);
        }

        return results;
    }

    public async Task<Watchlist?> GetByIdAsync(string id, CancellationToken cancellationToken = default)
    {
        try
        {
            var response = await Container.ReadItemAsync<Watchlist>(id, new PartitionKey(id), cancellationToken: CancellationToken.None);
            return response.Resource;
        }
        catch (CosmosException ex) when (ex.StatusCode == System.Net.HttpStatusCode.NotFound)
        {
            return null;
        }
    }

    public async Task<Watchlist> CreateAsync(Watchlist watchlist, CancellationToken cancellationToken = default)
    {
        var response = await Container.CreateItemAsync(watchlist, new PartitionKey(watchlist.Id), cancellationToken: CancellationToken.None);
        return response.Resource;
    }

    public async Task<Watchlist> UpdateAsync(Watchlist watchlist, CancellationToken cancellationToken = default)
    {
        var response = await Container.ReplaceItemAsync(watchlist, watchlist.Id, new PartitionKey(watchlist.Id), cancellationToken: CancellationToken.None);
        return response.Resource;
    }

    public async Task DeleteAsync(string id, CancellationToken cancellationToken = default)
    {
        await Container.DeleteItemAsync<Watchlist>(id, new PartitionKey(id));
    }
}
