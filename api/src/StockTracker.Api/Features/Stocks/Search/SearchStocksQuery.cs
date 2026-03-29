using MediatR;
using FluentValidation;
using StockTracker.Api.Infrastructure.StockData;

namespace StockTracker.Api.Features.Stocks.Search;

public record SearchStocksQuery(string Query) : IRequest<SearchStocksResult>;

public record SearchStocksResult(IReadOnlyList<StockSearchResultDto> Results);

public record StockSearchResultDto(string Symbol, string CompanyName, string Exchange, string Currency);

public class SearchStocksQueryValidator : AbstractValidator<SearchStocksQuery>
{
    public SearchStocksQueryValidator()
    {
        RuleFor(x => x.Query)
            .NotEmpty().WithMessage("Search query must not be empty.")
            .MinimumLength(1).WithMessage("Search query must be at least 1 character.");
    }
}

public class SearchStocksHandler(IStockDataService stockDataService)
    : IRequestHandler<SearchStocksQuery, SearchStocksResult>
{
    public async Task<SearchStocksResult> Handle(
        SearchStocksQuery request,
        CancellationToken cancellationToken)
    {
        var results = await stockDataService.SearchAsync(request.Query, cancellationToken);

        var dtos = results
            .Select(r => new StockSearchResultDto(r.Symbol, r.CompanyName, r.Exchange, r.Currency))
            .ToList();

        return new SearchStocksResult(dtos);
    }
}
