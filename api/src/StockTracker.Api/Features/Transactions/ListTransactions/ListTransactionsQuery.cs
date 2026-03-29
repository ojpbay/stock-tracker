using MediatR;
using StockTracker.Api.Domain;
using StockTracker.Api.Infrastructure.Cosmos;

namespace StockTracker.Api.Features.Transactions.ListTransactions;

public record ListTransactionsQuery(
    string WatchlistId,
    string HoldingId,
    string? TypeFilter = null) : IRequest<ListTransactionsResult>;

public record TransactionDto(
    string TransactionId,
    string Type,
    DateOnly TransactionDate,
    decimal? Units,
    decimal? PricePerUnit,
    decimal? DividendAmount,
    DateTimeOffset CreatedAt);

public record ListTransactionsResult(IReadOnlyList<TransactionDto> Transactions);

public class ListTransactionsHandler(ITransactionRepository transactionRepository)
    : IRequestHandler<ListTransactionsQuery, ListTransactionsResult>
{
    public async Task<ListTransactionsResult> Handle(ListTransactionsQuery request, CancellationToken cancellationToken)
    {
        var transactions = await transactionRepository.GetByHoldingAsync(
            request.WatchlistId, request.HoldingId, cancellationToken);

        var filtered = transactions.AsEnumerable();

        if (!string.IsNullOrEmpty(request.TypeFilter) &&
            Enum.TryParse<TransactionType>(request.TypeFilter, ignoreCase: true, out var typeFilter))
        {
            filtered = filtered.Where(t => t.Type == typeFilter);
        }

        var dtos = filtered
            .Select(t => new TransactionDto(
                t.TransactionId, t.Type.ToString(), t.TransactionDate,
                t.Units, t.PricePerUnit, t.DividendAmount, t.CreatedAt))
            .ToList();

        return new ListTransactionsResult(dtos);
    }
}
