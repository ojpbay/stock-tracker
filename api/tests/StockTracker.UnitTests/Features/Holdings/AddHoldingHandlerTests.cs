using FluentAssertions;
using Moq;
using StockTracker.Api.Domain;
using StockTracker.Api.Features.Holdings.AddHolding;
using StockTracker.Api.Infrastructure.Cosmos;
using StockTracker.Api.Infrastructure.StockData;

namespace StockTracker.UnitTests.Features.Holdings;

public class AddHoldingHandlerTests
{
    private readonly Mock<IWatchlistRepository> _repository = new();
    private readonly Mock<IStockDataService> _stockDataService = new();
    private readonly AddHoldingHandler _handler;

    private readonly Watchlist _watchlist = new()
    {
        Id = "watchlist-1",
        Name = "Test",
        Description = "",
    };

    private readonly StockQuote _quote = new(
        "AAPL", "Apple Inc.", "NASDAQ", "USD",
        189.50m, 2.30m, 1.23m, 2_950_000_000_000m, 199.62m, 164.08m, DateTimeOffset.UtcNow);

    public AddHoldingHandlerTests()
    {
        _handler = new AddHoldingHandler(_repository.Object, _stockDataService.Object);
    }

    [Fact]
    public async Task Handle_WithNewSymbol_CreatesHoldingAndReturnsResult()
    {
        // Arrange
        _repository.Setup(r => r.GetByIdAsync("watchlist-1", It.IsAny<CancellationToken>()))
            .ReturnsAsync(_watchlist);
        _repository.Setup(r => r.UpdateAsync(It.IsAny<Watchlist>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync((Watchlist w, CancellationToken _) => w);
        _stockDataService.Setup(s => s.GetQuoteAsync("AAPL", It.IsAny<CancellationToken>()))
            .ReturnsAsync(_quote);

        var command = new AddHoldingCommand("watchlist-1", "aapl", 10m, 150m, new DateOnly(2026, 1, 1));

        // Act
        var result = await _handler.Handle(command, CancellationToken.None);

        // Assert
        result.Should().NotBeNull();
        result!.WatchlistId.Should().Be("watchlist-1");
        result.Holding.StockSymbol.Should().Be("AAPL");
        result.Holding.TotalUnits.Should().Be(10m);
    }

    [Fact]
    public async Task Handle_WithUnknownSymbol_ThrowsArgumentException()
    {
        // Arrange
        _repository.Setup(r => r.GetByIdAsync("watchlist-1", It.IsAny<CancellationToken>()))
            .ReturnsAsync(_watchlist);
        _stockDataService.Setup(s => s.GetQuoteAsync(It.IsAny<string>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync((StockQuote?)null);

        var command = new AddHoldingCommand("watchlist-1", "UNKNOWN", 10m, 50m, new DateOnly(2026, 1, 1));

        // Act
        var act = async () => await _handler.Handle(command, CancellationToken.None);

        // Assert
        await act.Should().ThrowAsync<ArgumentException>();
    }

    [Fact]
    public async Task Handle_WithNonExistentWatchlist_ReturnsNull()
    {
        // Arrange
        _repository.Setup(r => r.GetByIdAsync(It.IsAny<string>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync((Watchlist?)null);

        var command = new AddHoldingCommand("missing", "AAPL", 10m, 150m, new DateOnly(2026, 1, 1));

        // Act
        var result = await _handler.Handle(command, CancellationToken.None);

        // Assert
        result.Should().BeNull();
    }

    [Fact]
    public async Task Handle_NormalisesSymbolToUpperCase()
    {
        // Arrange
        _repository.Setup(r => r.GetByIdAsync("watchlist-1", It.IsAny<CancellationToken>()))
            .ReturnsAsync(_watchlist);
        _repository.Setup(r => r.UpdateAsync(It.IsAny<Watchlist>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync((Watchlist w, CancellationToken _) => w);
        _stockDataService.Setup(s => s.GetQuoteAsync("AAPL", It.IsAny<CancellationToken>()))
            .ReturnsAsync(_quote);

        var command = new AddHoldingCommand("watchlist-1", "aapl", 5m, 120m, new DateOnly(2026, 1, 1));

        // Act
        await _handler.Handle(command, CancellationToken.None);

        // Assert
        _stockDataService.Verify(s => s.GetQuoteAsync("AAPL", It.IsAny<CancellationToken>()), Times.Once);
    }
}
