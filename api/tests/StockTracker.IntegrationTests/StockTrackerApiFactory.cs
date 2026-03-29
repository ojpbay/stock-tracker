using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.Azure.Cosmos;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.DependencyInjection.Extensions;

namespace StockTracker.IntegrationTests;

/// <summary>
/// WebApplicationFactory that configures the API to use the local Cosmos DB emulator.
/// Requires the Cosmos DB emulator to be running on port 8081.
/// </summary>
public class StockTrackerApiFactory : WebApplicationFactory<Program>, IAsyncLifetime
{
    private const string EmulatorConnectionString =
        "AccountEndpoint=https://localhost:8081/;AccountKey=C2y6yDjf5/R+ob0N8A7Cgv30VRDJIWEHLM+4QDU5DE2nQ9nDuVTqobD4b8mGGyPD8xiIZx0ow==;";

    private const string TestDatabaseName = "StockTrackerTestDb";

    protected override void ConfigureWebHost(IWebHostBuilder builder)
    {
        builder.UseEnvironment("Development");

        builder.ConfigureServices(services =>
        {
            // Remove the production CosmosClient and replace with emulator client
            services.RemoveAll<CosmosClient>();

            var cosmosClientOptions = new CosmosClientOptions
            {
                SerializerOptions = new CosmosSerializationOptions
                {
                    PropertyNamingPolicy = CosmosPropertyNamingPolicy.CamelCase
                },
                HttpClientFactory = () => new HttpClient(new HttpClientHandler
                {
                    ServerCertificateCustomValidationCallback =
                        HttpClientHandler.DangerousAcceptAnyServerCertificateValidator
                }),
                ConnectionMode = ConnectionMode.Gateway
            };

            services.AddSingleton(new CosmosClient(EmulatorConnectionString, cosmosClientOptions));

            // Override the database name to use the test database
            services.Configure<StockTracker.Api.Infrastructure.Cosmos.CosmosDbOptions>(opts =>
            {
                opts.DatabaseName = TestDatabaseName;
            });
        });
    }

    public async Task InitializeAsync()
    {
        // Trigger the WebApplicationFactory to build the application
        _ = Server;

        // Ensure test database containers exist
        using var scope = Services.CreateScope();
        var client = scope.ServiceProvider.GetRequiredService<CosmosClient>();
        var db = await client.CreateDatabaseIfNotExistsAsync(TestDatabaseName);
        await db.Database.CreateContainerIfNotExistsAsync(
            new ContainerProperties { Id = "watchlists", PartitionKeyPath = "/id" });
        await db.Database.CreateContainerIfNotExistsAsync(
            new ContainerProperties { Id = "transactions", PartitionKeyPath = "/watchlistId" });
    }

    public new async Task DisposeAsync()
    {
        // Clean up test database after each test class
        using var scope = Services.CreateScope();
        var client = scope.ServiceProvider.GetRequiredService<CosmosClient>();
        try
        {
            var db = client.GetDatabase(TestDatabaseName);
            await db.DeleteAsync();
        }
        catch
        {
            // Database may not exist if tests never ran
        }
    }
}
