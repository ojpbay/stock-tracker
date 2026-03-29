using MediatR;
using StockTracker.Api.Domain;
using StockTracker.Api.Infrastructure.Cosmos;

namespace StockTracker.Api.Features.Watchlists.ListWatchlists;

public record ListWatchlistsQuery : IRequest<ListWatchlistsResult>;

public record WatchlistSummaryDto(
    string Id,
    string Name,
    string Description,
    int HoldingCount,
    DateTimeOffset CreatedAt,
    DateTimeOffset UpdatedAt);

public record ListWatchlistsResult(IReadOnlyList<WatchlistSummaryDto> Watchlists);

public class ListWatchlistsHandler(IWatchlistRepository repository)
    : IRequestHandler<ListWatchlistsQuery, ListWatchlistsResult>
{
    public async Task<ListWatchlistsResult> Handle(ListWatchlistsQuery request, CancellationToken cancellationToken)
    {
        var watchlists = await repository.GetAllAsync(cancellationToken);
        var dtos = watchlists
            .Select(w => new WatchlistSummaryDto(w.Id, w.Name, w.Description, w.Holdings.Count, w.CreatedAt, w.UpdatedAt))
            .ToList();
        return new ListWatchlistsResult(dtos);
    }
}
