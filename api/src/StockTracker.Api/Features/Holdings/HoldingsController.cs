using MediatR;
using Microsoft.AspNetCore.Mvc;
using StockTracker.Api.Features.Holdings.AddHolding;

namespace StockTracker.Api.Features.Holdings;

[ApiController]
[Route("api/watchlists/{watchlistId}/holdings")]
public class HoldingsController(IMediator mediator) : ControllerBase
{
    /// <summary>Add a stock holding to a watchlist.</summary>
    [HttpPost]
    [ProducesResponseType(typeof(AddHoldingResult), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<AddHoldingResult>> AddHolding(
        string watchlistId,
        [FromBody] AddHoldingRequest body,
        CancellationToken cancellationToken)
    {
        try
        {
            var result = await mediator.Send(
                new AddHoldingCommand(watchlistId, body.StockSymbol, body.Units, body.PricePerUnit, body.PurchaseDate),
                cancellationToken);

            if (result is null)
                return NotFound(new { error = $"Watchlist '{watchlistId}' not found." });

            return CreatedAtAction(nameof(AddHolding), new { watchlistId }, result);
        }
        catch (ArgumentException ex)
        {
            return BadRequest(new { error = ex.Message });
        }
    }
}

public record AddHoldingRequest(
    string StockSymbol,
    decimal Units,
    decimal PricePerUnit,
    DateOnly PurchaseDate);
