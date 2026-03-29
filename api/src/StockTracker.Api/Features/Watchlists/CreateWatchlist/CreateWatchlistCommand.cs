using FluentValidation;
using MediatR;
using StockTracker.Api.Domain;
using StockTracker.Api.Features.Watchlists.GetWatchlist;
using StockTracker.Api.Infrastructure.Cosmos;

namespace StockTracker.Api.Features.Watchlists.CreateWatchlist;

public record CreateWatchlistCommand(string Name, string Description) : IRequest<WatchlistDetailDto>;

public class CreateWatchlistCommandValidator : AbstractValidator<CreateWatchlistCommand>
{
    public CreateWatchlistCommandValidator()
    {
        RuleFor(x => x.Name)
            .NotEmpty().WithMessage("Watchlist name is required.")
            .MaximumLength(100).WithMessage("Watchlist name must not exceed 100 characters.");

        RuleFor(x => x.Description)
            .MaximumLength(500).WithMessage("Description must not exceed 500 characters.");
    }
}

public class CreateWatchlistHandler(IWatchlistRepository repository)
    : IRequestHandler<CreateWatchlistCommand, WatchlistDetailDto>
{
    public async Task<WatchlistDetailDto> Handle(CreateWatchlistCommand request, CancellationToken cancellationToken)
    {
        var watchlist = new Watchlist
        {
            Name = request.Name,
            Description = request.Description,
        };

        var created = await repository.CreateAsync(watchlist, cancellationToken);

        return new WatchlistDetailDto(
            created.Id, created.Name, created.Description,
            created.CreatedAt, created.UpdatedAt, []);
    }
}
