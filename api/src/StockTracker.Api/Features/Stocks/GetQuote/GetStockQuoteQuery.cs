using MediatR;
using FluentValidation;
using StockTracker.Api.Infrastructure.StockData;

namespace StockTracker.Api.Features.Stocks.GetQuote;

public record GetStockQuoteQuery(string Symbol) : IRequest<GetStockQuoteResult?>;

public record GetStockQuoteResult(
    string Symbol,
    string CompanyName,
    string Exchange,
    string Currency,
    decimal CurrentPrice,
    decimal PriceChange,
    decimal PriceChangePercent,
    decimal MarketCap,
    decimal High52Week,
    decimal Low52Week,
    DateTimeOffset DataTimestamp);

public class GetStockQuoteQueryValidator : AbstractValidator<GetStockQuoteQuery>
{
    public GetStockQuoteQueryValidator()
    {
        RuleFor(x => x.Symbol)
            .NotEmpty().WithMessage("Stock symbol must not be empty.")
            .MaximumLength(10).WithMessage("Stock symbol must not exceed 10 characters.")
            .Matches(@"^[A-Za-z0-9.\-]+$").WithMessage("Stock symbol contains invalid characters.");
    }
}

public class GetStockQuoteHandler(IStockDataService stockDataService)
    : IRequestHandler<GetStockQuoteQuery, GetStockQuoteResult?>
{
    public async Task<GetStockQuoteResult?> Handle(
        GetStockQuoteQuery request,
        CancellationToken cancellationToken)
    {
        var quote = await stockDataService.GetQuoteAsync(
            request.Symbol.ToUpperInvariant(), cancellationToken);

        if (quote is null) return null;

        return new GetStockQuoteResult(
            quote.Symbol,
            quote.CompanyName,
            quote.Exchange,
            quote.Currency,
            quote.CurrentPrice,
            quote.PriceChange,
            quote.PriceChangePercent,
            quote.MarketCap,
            quote.High52Week,
            quote.Low52Week,
            quote.DataTimestamp);
    }
}
