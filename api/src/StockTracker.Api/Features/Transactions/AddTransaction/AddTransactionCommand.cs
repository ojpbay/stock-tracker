using FluentValidation;
using MediatR;
using StockTracker.Api.Domain;
using StockTracker.Api.Infrastructure.Cosmos;

namespace StockTracker.Api.Features.Transactions.AddTransaction;

public enum TransactionTypeRequest { Buy, Sell, Dividend }

public record AddTransactionCommand(
    string WatchlistId,
    string HoldingId,
    TransactionTypeRequest Type,
    DateOnly TransactionDate,
    decimal? Units,
    decimal? PricePerUnit,
    decimal? DividendAmount) : IRequest<AddTransactionResult?>;

public record AddTransactionResult(
    string TransactionId,
    string HoldingId,
    string Type,
    DateOnly TransactionDate,
    decimal? Units,
    decimal? PricePerUnit,
    decimal? DividendAmount);

public class AddTransactionCommandValidator : AbstractValidator<AddTransactionCommand>
{
    public AddTransactionCommandValidator()
    {
        RuleFor(x => x.TransactionDate)
            .LessThanOrEqualTo(DateOnly.FromDateTime(DateTime.UtcNow))
            .WithMessage("Transaction date cannot be in the future.");

        When(x => x.Type is TransactionTypeRequest.Buy or TransactionTypeRequest.Sell, () =>
        {
            RuleFor(x => x.Units)
                .NotNull().WithMessage("Units are required for Buy/Sell transactions.")
                .GreaterThan(0).WithMessage("Units must be greater than zero.");

            RuleFor(x => x.PricePerUnit)
                .NotNull().WithMessage("Price per unit is required for Buy/Sell transactions.")
                .GreaterThan(0).WithMessage("Price per unit must be greater than zero.");
        });

        When(x => x.Type == TransactionTypeRequest.Dividend, () =>
        {
            RuleFor(x => x.DividendAmount)
                .NotNull().WithMessage("Dividend amount is required.")
                .GreaterThan(0).WithMessage("Dividend amount must be greater than zero.");
        });
    }
}

public class AddTransactionHandler(
    IWatchlistRepository watchlistRepository,
    ITransactionRepository transactionRepository) : IRequestHandler<AddTransactionCommand, AddTransactionResult?>
{
    public async Task<AddTransactionResult?> Handle(AddTransactionCommand request, CancellationToken cancellationToken)
    {
        var watchlist = await watchlistRepository.GetByIdAsync(request.WatchlistId, cancellationToken);
        if (watchlist is null) return null;

        var holding = watchlist.Holdings.FirstOrDefault(h => h.HoldingId == request.HoldingId);
        if (holding is null) return null;

        Transaction transaction;

        switch (request.Type)
        {
            case TransactionTypeRequest.Buy:
                transaction = Transaction.CreateBuy(
                    request.WatchlistId, request.HoldingId, holding.StockSymbol,
                    request.Units!.Value, request.PricePerUnit!.Value, request.TransactionDate);

                // Update holding with recalculated average price
                var buyUpdate = new HoldingSummary(
                    holding.HoldingId, holding.StockSymbol, holding.CompanyName, holding.Exchange,
                    request.Units!.Value, request.PricePerUnit!.Value,
                    request.TransactionDate, HoldingStatus.Active);
                watchlist.AddOrUpdateHolding(buyUpdate);
                await watchlistRepository.UpdateAsync(watchlist, cancellationToken);
                break;

            case TransactionTypeRequest.Sell:
                if (request.Units!.Value > holding.TotalUnits)
                    throw new InvalidOperationException($"INSUFFICIENT_UNITS: Cannot sell {request.Units} units — only {holding.TotalUnits} held.");

                transaction = Transaction.CreateSell(
                    request.WatchlistId, request.HoldingId, holding.StockSymbol,
                    request.Units.Value, request.PricePerUnit!.Value, request.TransactionDate);

                var remainingUnits = holding.TotalUnits - request.Units.Value;
                var sellUpdate = new HoldingSummary(
                    holding.HoldingId, holding.StockSymbol, holding.CompanyName, holding.Exchange,
                    -request.Units.Value, holding.AveragePurchasePrice,
                    request.TransactionDate,
                    remainingUnits <= 0 ? HoldingStatus.Closed : HoldingStatus.Active);
                watchlist.AddOrUpdateHolding(sellUpdate);
                await watchlistRepository.UpdateAsync(watchlist, cancellationToken);
                break;

            case TransactionTypeRequest.Dividend:
                transaction = Transaction.CreateDividend(
                    request.WatchlistId, request.HoldingId, holding.StockSymbol,
                    request.DividendAmount!.Value, request.TransactionDate);
                break;

            default:
                throw new ArgumentOutOfRangeException(nameof(request.Type));
        }

        var saved = await transactionRepository.CreateAsync(transaction, cancellationToken);

        return new AddTransactionResult(
            saved.TransactionId, saved.HoldingId,
            saved.Type.ToString(), saved.TransactionDate,
            saved.Units, saved.PricePerUnit, saved.DividendAmount);
    }
}
