using MediatR;
using StockTracker.Api.Infrastructure.Cosmos;

namespace StockTracker.Api.Features.Watchlists.DeleteWatchlist;

public record DeleteWatchlistCommand(string Id) : IRequest<bool>;

public class DeleteWatchlistHandler(IWatchlistRepository repository)
    : IRequestHandler<DeleteWatchlistCommand, bool>
{
    public async Task<bool> Handle(DeleteWatchlistCommand request, CancellationToken cancellationToken)
    {
        var watchlist = await repository.GetByIdAsync(request.Id, cancellationToken);
        if (watchlist is null) return false;

        await repository.DeleteAsync(request.Id, cancellationToken);
        return true;
    }
}
