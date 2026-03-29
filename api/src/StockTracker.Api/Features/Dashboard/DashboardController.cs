using MediatR;
using Microsoft.AspNetCore.Mvc;
using StockTracker.Api.Features.Dashboard.GetDashboard;

namespace StockTracker.Api.Features.Dashboard;

[ApiController]
[Route("api/watchlists/{watchlistId}/dashboard")]
public class DashboardController(IMediator mediator) : ControllerBase
{
    /// <summary>Get the dashboard for a watchlist with live P&amp;L calculations.</summary>
    [HttpGet]
    [ProducesResponseType(typeof(DashboardResponseDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<DashboardResponseDto>> GetDashboard(
        string watchlistId,
        CancellationToken cancellationToken)
    {
        var result = await mediator.Send(new GetDashboardQuery(watchlistId), cancellationToken);

        if (result is null)
            return NotFound(new { error = $"Watchlist '{watchlistId}' not found." });

        return Ok(result);
    }
}
