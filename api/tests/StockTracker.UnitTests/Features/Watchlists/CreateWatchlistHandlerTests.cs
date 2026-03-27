using FluentAssertions;
using Moq;
using StockTracker.Api.Domain;
using StockTracker.Api.Features.Watchlists.CreateWatchlist;
using StockTracker.Api.Infrastructure.Cosmos;

namespace StockTracker.UnitTests.Features.Watchlists;

public class CreateWatchlistHandlerTests
{
    private readonly Mock<IWatchlistRepository> _repository = new();
    private readonly CreateWatchlistHandler _handler;

    public CreateWatchlistHandlerTests()
    {
        _handler = new CreateWatchlistHandler(_repository.Object);
    }

    [Fact]
    public async Task Handle_WithValidCommand_CreatesAndReturnsWatchlist()
    {
        // Arrange
        var command = new CreateWatchlistCommand("Tech Stocks", "My tech portfolio");
        _repository.Setup(r => r.CreateAsync(It.IsAny<Watchlist>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync((Watchlist w, CancellationToken _) => w);

        // Act
        var result = await _handler.Handle(command, CancellationToken.None);

        // Assert
        result.Should().NotBeNull();
        result.Name.Should().Be("Tech Stocks");
        result.Description.Should().Be("My tech portfolio");
        result.Id.Should().NotBeEmpty();
        result.Holdings.Should().BeEmpty();
    }

    [Fact]
    public async Task Handle_CallsRepositoryCreateExactlyOnce()
    {
        // Arrange
        _repository.Setup(r => r.CreateAsync(It.IsAny<Watchlist>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync((Watchlist w, CancellationToken _) => w);

        // Act
        await _handler.Handle(new CreateWatchlistCommand("Test", ""), CancellationToken.None);

        // Assert
        _repository.Verify(r => r.CreateAsync(It.IsAny<Watchlist>(), It.IsAny<CancellationToken>()), Times.Once);
    }
}
