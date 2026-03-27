using FluentAssertions;
using Moq;
using StockTracker.Api.Features.Stocks.Search;
using StockTracker.Api.Infrastructure.StockData;

namespace StockTracker.UnitTests.Features.Stocks;

public class SearchStocksHandlerTests
{
    private readonly Mock<IStockDataService> _stockDataService = new();
    private readonly SearchStocksHandler _handler;

    public SearchStocksHandlerTests()
    {
        _handler = new SearchStocksHandler(_stockDataService.Object);
    }

    [Fact]
    public async Task Handle_WithValidQuery_ReturnsMappedResults()
    {
        // Arrange
        _stockDataService.Setup(s => s.SearchAsync("Apple", It.IsAny<CancellationToken>()))
            .ReturnsAsync([
                new StockSearchResult("AAPL", "Apple Inc.", "NASDAQ", "USD"),
                new StockSearchResult("APLE", "Apple Hospitality REIT", "NYSE", "USD")
            ]);

        // Act
        var result = await _handler.Handle(new SearchStocksQuery("Apple"), CancellationToken.None);

        // Assert
        result.Results.Should().HaveCount(2);
        result.Results[0].Symbol.Should().Be("AAPL");
        result.Results[0].CompanyName.Should().Be("Apple Inc.");
    }

    [Fact]
    public async Task Handle_WhenProviderReturnsEmpty_ReturnsEmptyResults()
    {
        // Arrange
        _stockDataService.Setup(s => s.SearchAsync(It.IsAny<string>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync([]);

        // Act
        var result = await _handler.Handle(new SearchStocksQuery("xyznotfound"), CancellationToken.None);

        // Assert
        result.Results.Should().BeEmpty();
    }

    [Fact]
    public async Task Handle_ForwardsQueryToDataService()
    {
        // Arrange
        _stockDataService.Setup(s => s.SearchAsync(It.IsAny<string>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync([]);

        // Act
        await _handler.Handle(new SearchStocksQuery("Microsoft"), CancellationToken.None);

        // Assert
        _stockDataService.Verify(s => s.SearchAsync("Microsoft", It.IsAny<CancellationToken>()), Times.Once);
    }
}
