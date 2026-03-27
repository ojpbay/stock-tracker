using FluentValidation;
using MediatR;
using StockTracker.Api.Features.Watchlists.GetWatchlist;
using StockTracker.Api.Infrastructure.Cosmos;

namespace StockTracker.Api.Features.Watchlists.UpdateWatchlist;

public record UpdateWatchlistCommand(string Id, string Name, string Description) : IRequest<WatchlistDetailDto?>;

public class UpdateWatchlistCommandValidator : AbstractValidator<UpdateWatchlistCommand>
{
    public UpdateWatchlistCommandValidator()
    {
        RuleFor(x => x.Name)
            .NotEmpty().WithMessage("Watchlist name is required.")
            .MaximumLength(100).WithMessage("Watchlist name must not exceed 100 characters.");

        RuleFor(x => x.Description)
            .MaximumLength(500).WithMessage("Description must not exceed 500 characters.");
    }
}

public class UpdateWatchlistHandler(IWatchlistRepository repository)
    : IRequestHandler<UpdateWatchlistCommand, WatchlistDetailDto?>
{
    public async Task<WatchlistDetailDto?> Handle(UpdateWatchlistCommand request, CancellationToken cancellationToken)
    {
        var watchlist = await repository.GetByIdAsync(request.Id, cancellationToken);
        if (watchlist is null) return null;

        watchlist.Name = request.Name;
        watchlist.Description = request.Description;
        watchlist.UpdatedAt = DateTimeOffset.UtcNow;

        var updated = await repository.UpdateAsync(watchlist, cancellationToken);

        var holdings = updated.Holdings
            .Select(h => new HoldingSummaryDto(
                h.HoldingId, h.StockSymbol, h.CompanyName, h.Exchange,
                h.TotalUnits, h.AveragePurchasePrice, h.LastPurchaseDate, h.Status.ToString()))
            .ToList();

        return new WatchlistDetailDto(
            updated.Id, updated.Name, updated.Description,
            updated.CreatedAt, updated.UpdatedAt, holdings);
    }
}
