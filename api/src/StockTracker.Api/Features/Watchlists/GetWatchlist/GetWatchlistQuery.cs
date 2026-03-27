using MediatR;
using StockTracker.Api.Domain;
using StockTracker.Api.Infrastructure.Cosmos;

namespace StockTracker.Api.Features.Watchlists.GetWatchlist;

public record GetWatchlistQuery(string Id) : IRequest<WatchlistDetailDto?>;

public record HoldingSummaryDto(
    string HoldingId,
    string StockSymbol,
    string CompanyName,
    string Exchange,
    decimal TotalUnits,
    decimal AveragePurchasePrice,
    DateOnly LastPurchaseDate,
    string Status);

public record WatchlistDetailDto(
    string Id,
    string Name,
    string Description,
    DateTimeOffset CreatedAt,
    DateTimeOffset UpdatedAt,
    IReadOnlyList<HoldingSummaryDto> Holdings);

public class GetWatchlistHandler(IWatchlistRepository repository)
    : IRequestHandler<GetWatchlistQuery, WatchlistDetailDto?>
{
    public async Task<WatchlistDetailDto?> Handle(GetWatchlistQuery request, CancellationToken cancellationToken)
    {
        var watchlist = await repository.GetByIdAsync(request.Id, cancellationToken);
        if (watchlist is null) return null;

        var holdings = watchlist.Holdings
            .Select(h => new HoldingSummaryDto(
                h.HoldingId, h.StockSymbol, h.CompanyName, h.Exchange,
                h.TotalUnits, h.AveragePurchasePrice, h.LastPurchaseDate, h.Status.ToString()))
            .ToList();

        return new WatchlistDetailDto(
            watchlist.Id, watchlist.Name, watchlist.Description,
            watchlist.CreatedAt, watchlist.UpdatedAt, holdings);
    }
}
