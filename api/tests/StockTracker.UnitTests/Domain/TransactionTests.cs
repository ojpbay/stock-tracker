using FluentAssertions;
using StockTracker.Api.Domain;

namespace StockTracker.UnitTests.Domain;

public class TransactionTests
{
    [Fact]
    public void CreateBuy_SetsTypeAndRequiredFields()
    {
        var tx = Transaction.CreateBuy("wl-1", "h-1", "AAPL", 5m, 150m, new DateOnly(2026, 1, 1));

        tx.Type.Should().Be(TransactionType.Buy);
        tx.WatchlistId.Should().Be("wl-1");
        tx.HoldingId.Should().Be("h-1");
        tx.StockSymbol.Should().Be("AAPL");
        tx.Units.Should().Be(5m);
        tx.PricePerUnit.Should().Be(150m);
        tx.DividendAmount.Should().BeNull();
        tx.TransactionId.Should().NotBeNullOrEmpty();
    }

    [Fact]
    public void CreateSell_SetsTypeAndDoesNotSetDividend()
    {
        var tx = Transaction.CreateSell("wl-1", "h-1", "AAPL", 3m, 180m, new DateOnly(2026, 2, 1));

        tx.Type.Should().Be(TransactionType.Sell);
        tx.Units.Should().Be(3m);
        tx.PricePerUnit.Should().Be(180m);
        tx.DividendAmount.Should().BeNull();
    }

    [Fact]
    public void CreateDividend_SetsAmountAndDoesNotSetUnitFields()
    {
        var tx = Transaction.CreateDividend("wl-1", "h-1", "AAPL", 12.50m, new DateOnly(2026, 3, 1));

        tx.Type.Should().Be(TransactionType.Dividend);
        tx.DividendAmount.Should().Be(12.50m);
        tx.Units.Should().BeNull();
        tx.PricePerUnit.Should().BeNull();
    }

    [Fact]
    public void EachTransactionGetsUniqueId()
    {
        var tx1 = Transaction.CreateBuy("wl", "h", "AAPL", 1, 100, new DateOnly(2026, 1, 1));
        var tx2 = Transaction.CreateBuy("wl", "h", "AAPL", 1, 100, new DateOnly(2026, 1, 1));

        tx1.TransactionId.Should().NotBe(tx2.TransactionId);
    }
}
