using FluentAssertions;
using Moq;
using StockTracker.Api.Domain;
using StockTracker.Api.Features.Transactions.AddTransaction;
using StockTracker.Api.Infrastructure.Cosmos;

namespace StockTracker.UnitTests.Features.Transactions;

public class AddTransactionHandlerTests
{
    private readonly Mock<IWatchlistRepository> _watchlistRepo = new();
    private readonly Mock<ITransactionRepository> _transactionRepo = new();
    private readonly AddTransactionHandler _handler;

    private readonly Watchlist _watchlist;

    public AddTransactionHandlerTests()
    {
        _watchlist = new Watchlist
        {
            Id = "wl-1",
            Name = "Test",
            Holdings =
            [
                new HoldingSummary(
                    "h-1", "AAPL", "Apple Inc.", "NASDAQ",
                    10m, 150m, new DateOnly(2026, 1, 1), HoldingStatus.Active)
            ]
        };

        _watchlistRepo.Setup(r => r.GetByIdAsync("wl-1", It.IsAny<CancellationToken>()))
            .ReturnsAsync(_watchlist);
        _watchlistRepo.Setup(r => r.UpdateAsync(It.IsAny<Watchlist>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync((Watchlist w, CancellationToken _) => w);
        _transactionRepo.Setup(r => r.CreateAsync(It.IsAny<Transaction>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync((Transaction t, CancellationToken _) => t);

        _handler = new AddTransactionHandler(_watchlistRepo.Object, _transactionRepo.Object);
    }

    [Fact]
    public async Task Buy_RecalculatesWeightedAveragePrice()
    {
        // Existing: 10 @ 150 = 1500; Adding: 5 @ 200 = 1000; New avg = 2500/15 ≈ 166.67
        var command = new AddTransactionCommand(
            "wl-1", "h-1", TransactionTypeRequest.Buy,
            new DateOnly(2026, 2, 1), 5m, 200m, null);

        var result = await _handler.Handle(command, CancellationToken.None);

        result.Should().NotBeNull();
        result!.Type.Should().Be("Buy");
        result.Units.Should().Be(5m);

        // Verify holding was updated
        var holding = _watchlist.Holdings.First(h => h.HoldingId == "h-1");
        holding.TotalUnits.Should().Be(15m);
        holding.AveragePurchasePrice.Should().BeApproximately(166.6667m, 0.001m);
    }

    [Fact]
    public async Task Sell_UpdatesUnitsAndReturnsTransaction()
    {
        var command = new AddTransactionCommand(
            "wl-1", "h-1", TransactionTypeRequest.Sell,
            new DateOnly(2026, 2, 1), 3m, 180m, null);

        var result = await _handler.Handle(command, CancellationToken.None);

        result.Should().NotBeNull();
        result!.Type.Should().Be("Sell");
        var holding = _watchlist.Holdings.First(h => h.HoldingId == "h-1");
        holding.TotalUnits.Should().Be(7m);
    }

    [Fact]
    public async Task Sell_BeyondHeldUnits_ThrowsInvalidOperation()
    {
        var command = new AddTransactionCommand(
            "wl-1", "h-1", TransactionTypeRequest.Sell,
            new DateOnly(2026, 2, 1), 15m, 180m, null);

        var act = async () => await _handler.Handle(command, CancellationToken.None);

        await act.Should().ThrowAsync<InvalidOperationException>()
            .WithMessage("*INSUFFICIENT_UNITS*");
    }

    [Fact]
    public async Task Dividend_RecordsAmountWithoutAffectingHolding()
    {
        var originalUnits = _watchlist.Holdings[0].TotalUnits;
        var command = new AddTransactionCommand(
            "wl-1", "h-1", TransactionTypeRequest.Dividend,
            new DateOnly(2026, 2, 1), null, null, 12.50m);

        var result = await _handler.Handle(command, CancellationToken.None);

        result.Should().NotBeNull();
        result!.Type.Should().Be("Dividend");
        result.DividendAmount.Should().Be(12.50m);
        _watchlist.Holdings[0].TotalUnits.Should().Be(originalUnits); // unchanged
    }

    [Fact]
    public async Task Handle_WithUnknownWatchlist_ReturnsNull()
    {
        _watchlistRepo.Setup(r => r.GetByIdAsync("missing", It.IsAny<CancellationToken>()))
            .ReturnsAsync((Watchlist?)null);

        var command = new AddTransactionCommand(
            "missing", "h-1", TransactionTypeRequest.Buy,
            new DateOnly(2026, 2, 1), 5m, 200m, null);

        var result = await _handler.Handle(command, CancellationToken.None);

        result.Should().BeNull();
    }
}
