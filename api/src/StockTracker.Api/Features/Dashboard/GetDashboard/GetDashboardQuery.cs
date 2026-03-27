using MediatR;
using StockTracker.Api.Infrastructure.Cosmos;
using StockTracker.Api.Infrastructure.StockData;

namespace StockTracker.Api.Features.Dashboard.GetDashboard;

public record GetDashboardQuery(string WatchlistId) : IRequest<DashboardResponseDto?>;

public record HoldingDashboardRow(
    string HoldingId,
    string StockSymbol,
    string CompanyName,
    string Exchange,
    decimal TotalUnits,
    decimal AveragePurchasePrice,
    DateOnly LastPurchaseDate,
    decimal? CurrentPrice,
    decimal? CurrentValue,
    decimal? UnrealisedPnL,
    decimal? UnrealisedPnLPercent,
    bool PriceIsStale);

public record DashboardSummary(
    decimal TotalCost,
    decimal? TotalCurrentValue,
    decimal? TotalUnrealisedPnL,
    decimal? TotalUnrealisedPnLPercent);

public record DashboardResponseDto(
    string WatchlistId,
    string WatchlistName,
    IReadOnlyList<HoldingDashboardRow> Holdings,
    DashboardSummary Summary);

public class GetDashboardHandler(
    IWatchlistRepository repository,
    IStockDataService stockDataService) : IRequestHandler<GetDashboardQuery, DashboardResponseDto?>
{
    public async Task<DashboardResponseDto?> Handle(GetDashboardQuery request, CancellationToken cancellationToken)
    {
        var watchlist = await repository.GetByIdAsync(request.WatchlistId, cancellationToken);
        if (watchlist is null) return null;

        var activeHoldings = watchlist.Holdings
            .Where(h => h.Status == Domain.HoldingStatus.Active)
            .ToList();

        // Fetch prices for all active holdings in parallel
        var quoteTasks = activeHoldings.ToDictionary(
            h => h.StockSymbol,
            h => stockDataService.GetQuoteAsync(h.StockSymbol, cancellationToken));

        await Task.WhenAll(quoteTasks.Values);

        var rows = activeHoldings.Select(holding =>
        {
            var quoteTask = quoteTasks[holding.StockSymbol];
            var quote = quoteTask.Result;
            var priceIsStale = quote is null;

            var currentPrice = quote?.CurrentPrice;
            var currentValue = currentPrice.HasValue ? currentPrice * holding.TotalUnits : (decimal?)null;
            var totalCostForHolding = holding.AveragePurchasePrice * holding.TotalUnits;
            var unrealisedPnL = currentValue.HasValue ? currentValue - totalCostForHolding : (decimal?)null;
            var unrealisedPnLPercent = unrealisedPnL.HasValue && totalCostForHolding != 0
                ? Math.Round(unrealisedPnL.Value / totalCostForHolding * 100, 2)
                : (decimal?)null;

            return new HoldingDashboardRow(
                holding.HoldingId,
                holding.StockSymbol,
                holding.CompanyName,
                holding.Exchange,
                holding.TotalUnits,
                holding.AveragePurchasePrice,
                holding.LastPurchaseDate,
                currentPrice,
                currentValue.HasValue ? Math.Round(currentValue.Value, 2) : null,
                unrealisedPnL.HasValue ? Math.Round(unrealisedPnL.Value, 2) : null,
                unrealisedPnLPercent,
                priceIsStale);
        }).ToList();

        var totalCost = activeHoldings.Sum(h => h.AveragePurchasePrice * h.TotalUnits);
        var totalCurrentValue = rows.All(r => r.CurrentValue.HasValue)
            ? rows.Sum(r => r.CurrentValue!.Value)
            : (decimal?)null;
        var totalUnrealisedPnL = totalCurrentValue.HasValue ? totalCurrentValue - totalCost : (decimal?)null;
        var totalUnrealisedPnLPercent = totalUnrealisedPnL.HasValue && totalCost != 0
            ? Math.Round(totalUnrealisedPnL.Value / totalCost * 100, 2)
            : (decimal?)null;

        var summary = new DashboardSummary(
            Math.Round(totalCost, 2),
            totalCurrentValue.HasValue ? Math.Round(totalCurrentValue.Value, 2) : null,
            totalUnrealisedPnL.HasValue ? Math.Round(totalUnrealisedPnL.Value, 2) : null,
            totalUnrealisedPnLPercent);

        return new DashboardResponseDto(watchlist.Id, watchlist.Name, rows, summary);
    }
}
