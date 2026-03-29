using MediatR;
using Microsoft.AspNetCore.Mvc;
using StockTracker.Api.Features.Transactions.AddTransaction;
using StockTracker.Api.Features.Transactions.ListTransactions;

namespace StockTracker.Api.Features.Transactions;

[ApiController]
[Route("api/watchlists/{watchlistId}/holdings/{holdingId}/transactions")]
public class TransactionsController(IMediator mediator) : ControllerBase
{
    /// <summary>Add a transaction (Buy, Sell, or Dividend) to a holding.</summary>
    [HttpPost]
    [ProducesResponseType(typeof(AddTransactionResult), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<AddTransactionResult>> AddTransaction(
        string watchlistId,
        string holdingId,
        [FromBody] AddTransactionRequest body,
        CancellationToken cancellationToken)
    {
        try
        {
            var result = await mediator.Send(
                new AddTransactionCommand(
                    watchlistId, holdingId,
                    body.Type, body.TransactionDate,
                    body.Units, body.PricePerUnit, body.DividendAmount),
                cancellationToken);

            if (result is null)
                return NotFound(new { error = $"Watchlist or holding not found." });

            return CreatedAtAction(nameof(ListTransactions), new { watchlistId, holdingId }, result);
        }
        catch (InvalidOperationException ex) when (ex.Message.StartsWith("INSUFFICIENT_UNITS"))
        {
            return BadRequest(new { error = ex.Message, code = "INSUFFICIENT_UNITS" });
        }
    }

    /// <summary>List all transactions for a holding.</summary>
    [HttpGet]
    [ProducesResponseType(typeof(ListTransactionsResult), StatusCodes.Status200OK)]
    public async Task<ActionResult<ListTransactionsResult>> ListTransactions(
        string watchlistId,
        string holdingId,
        [FromQuery] string? type,
        CancellationToken cancellationToken)
    {
        var result = await mediator.Send(
            new ListTransactionsQuery(watchlistId, holdingId, type),
            cancellationToken);
        return Ok(result);
    }
}

public record AddTransactionRequest(
    TransactionTypeRequest Type,
    DateOnly TransactionDate,
    decimal? Units,
    decimal? PricePerUnit,
    decimal? DividendAmount);
