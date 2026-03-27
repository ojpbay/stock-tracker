using FluentAssertions;
using Moq;
using StockTracker.Api.Features.Stocks.GetQuote;
using StockTracker.Api.Infrastructure.StockData;

namespace StockTracker.UnitTests.Features.Stocks;

public class GetStockQuoteHandlerTests
{
    private readonly Mock<IStockDataService> _stockDataService = new();
    private readonly GetStockQuoteHandler _handler;

    public GetStockQuoteHandlerTests()
    {
        _handler = new GetStockQuoteHandler(_stockDataService.Object);
    }

    [Fact]
    public async Task Handle_WithValidSymbol_ReturnsMappedQuote()
    {
        // Arrange
        var quote = new StockQuote("AAPL", "Apple Inc.", "NASDAQ", "USD",
            189.50m, 2.30m, 1.23m, 2_950_000_000_000m, 199.62m, 164.08m, DateTimeOffset.UtcNow);

        _stockDataService.Setup(s => s.GetQuoteAsync("AAPL", It.IsAny<CancellationToken>()))
            .ReturnsAsync(quote);

        // Act
        var result = await _handler.Handle(new GetStockQuoteQuery("AAPL"), CancellationToken.None);

        // Assert
        result.Should().NotBeNull();
        result!.Symbol.Should().Be("AAPL");
        result.CurrentPrice.Should().Be(189.50m);
        result.PriceChange.Should().Be(2.30m);
    }

    [Fact]
    public async Task Handle_WithUnknownSymbol_ReturnsNull()
    {
        // Arrange
        _stockDataService.Setup(s => s.GetQuoteAsync(It.IsAny<string>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync((StockQuote?)null);

        // Act
        var result = await _handler.Handle(new GetStockQuoteQuery("UNKNOWN"), CancellationToken.None);

        // Assert
        result.Should().BeNull();
    }

    [Fact]
    public async Task Handle_UpperCasesSymbolBeforeQuerying()
    {
        // Arrange
        _stockDataService.Setup(s => s.GetQuoteAsync("AAPL", It.IsAny<CancellationToken>()))
            .ReturnsAsync((StockQuote?)null);

        // Act
        await _handler.Handle(new GetStockQuoteQuery("aapl"), CancellationToken.None);

        // Assert — handler must normalise symbol to uppercase
        _stockDataService.Verify(s => s.GetQuoteAsync("AAPL", It.IsAny<CancellationToken>()), Times.Once);
    }
}
