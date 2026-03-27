using MediatR;
using Microsoft.AspNetCore.Mvc;
using StockTracker.Api.Features.Watchlists.CreateWatchlist;
using StockTracker.Api.Features.Watchlists.DeleteWatchlist;
using StockTracker.Api.Features.Watchlists.GetWatchlist;
using StockTracker.Api.Features.Watchlists.ListWatchlists;
using StockTracker.Api.Features.Watchlists.UpdateWatchlist;

namespace StockTracker.Api.Features.Watchlists;

[ApiController]
[Route("api/watchlists")]
public class WatchlistsController(IMediator mediator) : ControllerBase
{
    /// <summary>List all watchlists.</summary>
    [HttpGet]
    [ProducesResponseType(typeof(ListWatchlistsResult), StatusCodes.Status200OK)]
    public async Task<ActionResult<ListWatchlistsResult>> List(CancellationToken cancellationToken)
    {
        var result = await mediator.Send(new ListWatchlistsQuery(), cancellationToken);
        return Ok(result);
    }

    /// <summary>Get a watchlist by ID.</summary>
    [HttpGet("{id}")]
    [ProducesResponseType(typeof(WatchlistDetailDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<WatchlistDetailDto>> Get(string id, CancellationToken cancellationToken)
    {
        var result = await mediator.Send(new GetWatchlistQuery(id), cancellationToken);
        if (result is null) return NotFound(new { error = $"Watchlist '{id}' not found." });
        return Ok(result);
    }

    /// <summary>Create a new watchlist.</summary>
    [HttpPost]
    [ProducesResponseType(typeof(WatchlistDetailDto), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<WatchlistDetailDto>> Create(
        [FromBody] CreateWatchlistCommand command,
        CancellationToken cancellationToken)
    {
        var result = await mediator.Send(command, cancellationToken);
        return CreatedAtAction(nameof(Get), new { id = result.Id }, result);
    }

    /// <summary>Update a watchlist's name and description.</summary>
    [HttpPut("{id}")]
    [ProducesResponseType(typeof(WatchlistDetailDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<WatchlistDetailDto>> Update(
        string id,
        [FromBody] UpdateWatchlistRequest body,
        CancellationToken cancellationToken)
    {
        var result = await mediator.Send(new UpdateWatchlistCommand(id, body.Name, body.Description), cancellationToken);
        if (result is null) return NotFound(new { error = $"Watchlist '{id}' not found." });
        return Ok(result);
    }

    /// <summary>Delete a watchlist.</summary>
    [HttpDelete("{id}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> Delete(string id, CancellationToken cancellationToken)
    {
        var deleted = await mediator.Send(new DeleteWatchlistCommand(id), cancellationToken);
        if (!deleted) return NotFound(new { error = $"Watchlist '{id}' not found." });
        return NoContent();
    }
}

public record UpdateWatchlistRequest(string Name, string Description);
