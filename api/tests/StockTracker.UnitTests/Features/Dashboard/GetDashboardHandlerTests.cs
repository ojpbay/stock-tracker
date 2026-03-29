using FluentAssertions;
using Moq;
using StockTracker.Api.Domain;
using StockTracker.Api.Features.Dashboard.GetDashboard;
using StockTracker.Api.Infrastructure.Cosmos;
using StockTracker.Api.Infrastructure.StockData;

namespace StockTracker.UnitTests.Features.Dashboard;

public class GetDashboardHandlerTests
{
    private readonly Mock<IWatchlistRepository> _repository = new();
    private readonly Mock<IStockDataService> _stockDataService = new();
    private readonly GetDashboardHandler _handler;

    private readonly Watchlist _watchlist = new()
    {
        Id = "wl-1",
        Name = "Tech",
        Holdings =
        [
            new HoldingSummary(
                "h-1", "AAPL", "Apple Inc.", "NASDAQ",
                10m, 150m, new DateOnly(2026, 1, 1), HoldingStatus.Active)
        ]
    };

    public GetDashboardHandlerTests()
    {
        _handler = new GetDashboardHandler(_repository.Object, _stockDataService.Object);
    }

    [Fact]
    public async Task Handle_WithValidWatchlist_ReturnsPopulatedDashboard()
    {
        _repository.Setup(r => r.GetByIdAsync("wl-1", It.IsAny<CancellationToken>()))
            .ReturnsAsync(_watchlist);
        _stockDataService.Setup(s => s.GetQuoteAsync("AAPL", It.IsAny<CancellationToken>()))
            .ReturnsAsync(new StockQuote("AAPL", "Apple Inc.", "NASDAQ", "USD",
                200m, 10m, 5m, 3_000_000_000_000m, 220m, 150m, DateTimeOffset.UtcNow));

        var result = await _handler.Handle(new GetDashboardQuery("wl-1"), CancellationToken.None);

        result.Should().NotBeNull();
        result!.WatchlistId.Should().Be("wl-1");
        result.Holdings.Should().HaveCount(1);

        var row = result.Holdings[0];
        row.StockSymbol.Should().Be("AAPL");
        row.CurrentPrice.Should().Be(200m);
        // Cost = 10 × 150 = 1500; CurrentValue = 10 × 200 = 2000; UnrealisedPnL = 500
        row.UnrealisedPnL.Should().Be(500m);
        row.PriceIsStale.Should().BeFalse();
    }

    [Fact]
    public async Task Handle_WhenProviderUnavailable_SetsStaleFlag()
    {
        _repository.Setup(r => r.GetByIdAsync("wl-1", It.IsAny<CancellationToken>()))
            .ReturnsAsync(_watchlist);
        _stockDataService.Setup(s => s.GetQuoteAsync(It.IsAny<string>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync((StockQuote?)null);

        var result = await _handler.Handle(new GetDashboardQuery("wl-1"), CancellationToken.None);

        result.Should().NotBeNull();
        result!.Holdings[0].PriceIsStale.Should().BeTrue();
        result.Holdings[0].CurrentPrice.Should().BeNull();
    }

    [Fact]
    public async Task Handle_WithUnknownWatchlist_ReturnsNull()
    {
        _repository.Setup(r => r.GetByIdAsync(It.IsAny<string>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync((Watchlist?)null);

        var result = await _handler.Handle(new GetDashboardQuery("missing"), CancellationToken.None);

        result.Should().BeNull();
    }

    [Fact]
    public async Task Handle_CalculatesSummaryTotalsCorrectly()
    {
        var watchlistWithTwo = new Watchlist
        {
            Id = "wl-2",
            Name = "Multi",
            Holdings =
            [
                new HoldingSummary("h-1", "AAPL", "Apple", "NASDAQ", 10m, 150m, new DateOnly(2026, 1, 1), HoldingStatus.Active),
                new HoldingSummary("h-2", "MSFT", "Microsoft", "NASDAQ", 5m, 300m, new DateOnly(2026, 1, 1), HoldingStatus.Active)
            ]
        };
        _repository.Setup(r => r.GetByIdAsync("wl-2", It.IsAny<CancellationToken>()))
            .ReturnsAsync(watchlistWithTwo);
        _stockDataService.Setup(s => s.GetQuoteAsync("AAPL", It.IsAny<CancellationToken>()))
            .ReturnsAsync(new StockQuote("AAPL", "Apple", "NASDAQ", "USD", 200m, 0, 0, 0, 0, 0, DateTimeOffset.UtcNow));
        _stockDataService.Setup(s => s.GetQuoteAsync("MSFT", It.IsAny<CancellationToken>()))
            .ReturnsAsync(new StockQuote("MSFT", "Microsoft", "NASDAQ", "USD", 350m, 0, 0, 0, 0, 0, DateTimeOffset.UtcNow));

        var result = await _handler.Handle(new GetDashboardQuery("wl-2"), CancellationToken.None);

        // TotalCost = (10×150) + (5×300) = 1500 + 1500 = 3000
        // TotalCurrentValue = (10×200) + (5×350) = 2000 + 1750 = 3750
        // TotalUnrealisedPnL = 750
        result!.Summary.TotalCost.Should().Be(3000m);
        result.Summary.TotalCurrentValue.Should().Be(3750m);
        result.Summary.TotalUnrealisedPnL.Should().Be(750m);
    }
}
