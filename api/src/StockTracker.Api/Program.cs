using Microsoft.Azure.Cosmos;
using StockTracker.Api.Infrastructure.Cosmos;
using StockTracker.Api.Infrastructure.StockData;
using FluentValidation;
using FluentValidation.Results;
using System.Reflection;
using Microsoft.AspNetCore.Diagnostics;

var builder = WebApplication.CreateBuilder(args);

// ── Controllers ────────────────────────────────────────────────────────────
builder.Services.AddControllers()
    .AddJsonOptions(opts =>
        opts.JsonSerializerOptions.Converters.Add(new System.Text.Json.Serialization.JsonStringEnumConverter()));

// ── OpenAPI ────────────────────────────────────────────────────────────────
builder.Services.AddOpenApi();
builder.Services.AddEndpointsApiExplorer();

// ── MediatR ────────────────────────────────────────────────────────────────
builder.Services.AddMediatR(cfg =>
    cfg.RegisterServicesFromAssembly(Assembly.GetExecutingAssembly()));

// ── FluentValidation ───────────────────────────────────────────────────────
builder.Services.AddValidatorsFromAssembly(Assembly.GetExecutingAssembly());

// ── Cosmos DB ──────────────────────────────────────────────────────────────
builder.Services.Configure<CosmosDbOptions>(builder.Configuration.GetSection("CosmosDb"));

var cosmosConnectionString = builder.Configuration["CosmosDb:ConnectionString"]
    ?? throw new InvalidOperationException("CosmosDb:ConnectionString is required");

CosmosClientOptions cosmosClientOptions = new()
{
    SerializerOptions = new CosmosSerializationOptions
    {
        PropertyNamingPolicy = CosmosPropertyNamingPolicy.CamelCase
    }
};

if (builder.Environment.IsDevelopment())
{
    // Trust the Cosmos emulator self-signed cert in development
    cosmosClientOptions.HttpClientFactory = () => new HttpClient(
        new HttpClientHandler
        {
            ServerCertificateCustomValidationCallback =
                HttpClientHandler.DangerousAcceptAnyServerCertificateValidator
        });
    cosmosClientOptions.ConnectionMode = ConnectionMode.Gateway;
}

builder.Services.AddSingleton(new CosmosClient(cosmosConnectionString, cosmosClientOptions));
builder.Services.AddSingleton<CosmosDbInitialiser>();
builder.Services.AddScoped<IWatchlistRepository, WatchlistRepository>();
builder.Services.AddScoped<ITransactionRepository, TransactionRepository>();

// ── Finnhub Stock Data ─────────────────────────────────────────────────────
var finnhubOptions = builder.Configuration
    .GetSection(FinnhubOptions.SectionName)
    .Get<FinnhubOptions>() ?? new FinnhubOptions();

builder.Services.AddHttpClient<IStockDataService, FinnhubClient>(client =>
{
    client.BaseAddress = new Uri(finnhubOptions.BaseUrl);
    if (!string.IsNullOrEmpty(finnhubOptions.ApiKey))
        client.DefaultRequestHeaders.Add("X-Finnhub-Token", finnhubOptions.ApiKey);
});

// ── CORS ───────────────────────────────────────────────────────────────────
var allowedOrigins = builder.Configuration.GetSection("Cors:AllowedOrigins").Get<string[]>()
    ?? ["http://localhost:4200"];

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAngularDev", policy =>
        policy.WithOrigins(allowedOrigins)
              .AllowAnyMethod()
              .AllowAnyHeader());
});

// ── Health Checks ──────────────────────────────────────────────────────────
builder.Services.AddHealthChecks();

// ═══════════════════════════════════════════════════════════════════════════
var app = builder.Build();
// ═══════════════════════════════════════════════════════════════════════════

// Initialise Cosmos DB containers on startup
using (var scope = app.Services.CreateScope())
{
    var initialiser = scope.ServiceProvider.GetRequiredService<CosmosDbInitialiser>();
    await initialiser.InitialiseAsync();
}

app.UseExceptionHandler(errApp =>
{
    errApp.Run(async context =>
    {
        var feature = context.Features.Get<IExceptionHandlerFeature>();
        var exception = feature?.Error;

        context.Response.ContentType = "application/json";

        if (exception is ValidationException validationEx)
        {
            context.Response.StatusCode = StatusCodes.Status400BadRequest;
            var errors = validationEx.Errors
                .GroupBy(e => e.PropertyName)
                .ToDictionary(g => g.Key, g => g.Select(e => e.ErrorMessage).ToArray());
            await context.Response.WriteAsJsonAsync(new { error = "Validation failed", errors });
            return;
        }

        context.Response.StatusCode = StatusCodes.Status500InternalServerError;
        await context.Response.WriteAsJsonAsync(new
        {
            error = "An unexpected error occurred. Please try again later."
        });
    });
});

if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

app.UseCors("AllowAngularDev");
if (!app.Environment.IsDevelopment())
    app.UseHttpsRedirection();
app.UseAuthorization();
app.MapControllers();
app.MapHealthChecks("/health");

app.Run();

// Make Program accessible to WebApplicationFactory in integration tests
public partial class Program { }
