namespace StockTracker.Api.Domain;

public class Watchlist
{
    public string Id { get; init; } = Guid.NewGuid().ToString();
    public string Name { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public DateTimeOffset CreatedAt { get; init; } = DateTimeOffset.UtcNow;
    public DateTimeOffset UpdatedAt { get; set; } = DateTimeOffset.UtcNow;
    public List<HoldingSummary> Holdings { get; init; } = [];

    public void AddOrUpdateHolding(HoldingSummary incoming)
    {
        var existing = Holdings.FirstOrDefault(h => h.StockSymbol == incoming.StockSymbol);

        if (existing is null)
        {
            Holdings.Add(incoming);
        }
        else
        {
            var totalUnits = existing.TotalUnits + incoming.TotalUnits;
            var averagePrice = totalUnits == 0
                ? 0
                : ((existing.AveragePurchasePrice * existing.TotalUnits) +
                   (incoming.AveragePurchasePrice * incoming.TotalUnits)) / totalUnits;

            var index = Holdings.IndexOf(existing);
            Holdings[index] = existing with
            {
                TotalUnits = totalUnits,
                AveragePurchasePrice = Math.Round(averagePrice, 4),
                LastPurchaseDate = incoming.LastPurchaseDate > existing.LastPurchaseDate
                    ? incoming.LastPurchaseDate
                    : existing.LastPurchaseDate,
                Status = incoming.TotalUnits > 0 ? HoldingStatus.Active : HoldingStatus.Closed,
            };
        }

        UpdatedAt = DateTimeOffset.UtcNow;
    }
}
