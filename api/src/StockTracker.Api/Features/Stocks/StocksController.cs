using MediatR;
using Microsoft.AspNetCore.Mvc;
using StockTracker.Api.Features.Stocks.GetQuote;
using StockTracker.Api.Features.Stocks.Search;

namespace StockTracker.Api.Features.Stocks;

[ApiController]
[Route("api/stocks")]
public class StocksController(IMediator mediator) : ControllerBase
{
    /// <summary>Search stocks by company name or ticker symbol.</summary>
    [HttpGet("search")]
    [ProducesResponseType(typeof(SearchStocksResult), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<SearchStocksResult>> Search(
        [FromQuery] string q,
        CancellationToken cancellationToken)
    {
        if (string.IsNullOrWhiteSpace(q))
            return BadRequest(new { error = "Query parameter 'q' is required." });

        var result = await mediator.Send(new SearchStocksQuery(q), cancellationToken);
        return Ok(result);
    }

    /// <summary>Get a live stock quote by ticker symbol.</summary>
    [HttpGet("{symbol}")]
    [ProducesResponseType(typeof(GetStockQuoteResult), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<GetStockQuoteResult>> GetQuote(
        string symbol,
        CancellationToken cancellationToken)
    {
        var result = await mediator.Send(new GetStockQuoteQuery(symbol), cancellationToken);

        if (result is null)
            return NotFound(new { error = $"Stock '{symbol}' not found.", code = "SYMBOL_NOT_FOUND" });

        return Ok(result);
    }
}
