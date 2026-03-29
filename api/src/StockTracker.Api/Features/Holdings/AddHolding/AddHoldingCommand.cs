using FluentValidation;
using MediatR;
using StockTracker.Api.Domain;
using StockTracker.Api.Features.Watchlists.GetWatchlist;
using StockTracker.Api.Infrastructure.Cosmos;
using StockTracker.Api.Infrastructure.StockData;

namespace StockTracker.Api.Features.Holdings.AddHolding;

public record AddHoldingCommand(
    string WatchlistId,
    string StockSymbol,
    decimal Units,
    decimal PricePerUnit,
    DateOnly PurchaseDate) : IRequest<AddHoldingResult?>;

public record AddHoldingResult(
    string WatchlistId,
    HoldingSummaryDto Holding);

public class AddHoldingCommandValidator : AbstractValidator<AddHoldingCommand>
{
    public AddHoldingCommandValidator()
    {
        RuleFor(x => x.StockSymbol)
            .NotEmpty().WithMessage("Stock symbol is required.")
            .MaximumLength(10).WithMessage("Stock symbol must not exceed 10 characters.");

        RuleFor(x => x.Units)
            .GreaterThan(0).WithMessage("Units must be greater than zero.");

        RuleFor(x => x.PricePerUnit)
            .GreaterThan(0).WithMessage("Price per unit must be greater than zero.");

        RuleFor(x => x.PurchaseDate)
            .LessThanOrEqualTo(DateOnly.FromDateTime(DateTime.UtcNow))
            .WithMessage("Purchase date cannot be in the future.");
    }
}

public class AddHoldingHandler(
    IWatchlistRepository repository,
    IStockDataService stockDataService) : IRequestHandler<AddHoldingCommand, AddHoldingResult?>
{
    public async Task<AddHoldingResult?> Handle(AddHoldingCommand request, CancellationToken cancellationToken)
    {
        var watchlist = await repository.GetByIdAsync(request.WatchlistId, cancellationToken);
        if (watchlist is null) return null;

        var normalised = request.StockSymbol.ToUpperInvariant();

        // Validate stock exists via the data service
        var quote = await stockDataService.GetQuoteAsync(normalised, cancellationToken);
        if (quote is null)
            throw new ArgumentException($"Stock symbol '{normalised}' was not found.", nameof(request.StockSymbol));

        var holding = new HoldingSummary(
            HoldingId: Guid.NewGuid().ToString(),
            StockSymbol: normalised,
            CompanyName: quote.CompanyName,
            Exchange: quote.Exchange,
            TotalUnits: request.Units,
            AveragePurchasePrice: request.PricePerUnit,
            LastPurchaseDate: request.PurchaseDate,
            Status: HoldingStatus.Active);

        watchlist.AddOrUpdateHolding(holding);
        await repository.UpdateAsync(watchlist, cancellationToken);

        var updated = watchlist.Holdings.First(h => h.StockSymbol == normalised);

        var dto = new HoldingSummaryDto(
            updated.HoldingId,
            updated.StockSymbol,
            updated.CompanyName,
            updated.Exchange,
            updated.TotalUnits,
            updated.AveragePurchasePrice,
            updated.LastPurchaseDate,
            updated.Status.ToString());

        return new AddHoldingResult(watchlist.Id, dto);
    }
}
