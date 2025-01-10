using CryptoAnalyticsAPI.Database;
using CryptoAnalyticsAPI.Models;
using CryptoAnalyticsAPI.Repositories;
using CryptoAnalyticsAPI.Services;


using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container
builder.Services.AddControllers();

// Register SignalR services
builder.Services.AddSignalR();
// Add Swagger services
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();


// Add HttpClient for external API services
builder.Services.AddHttpClient<CoinMarketCapService>();

// Configure EF Core with SQLite
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseSqlite(builder.Configuration.GetConnectionString("DefaultConnection")));

// Register Repositories and Services
builder.Services.AddScoped<HistoricalDataRepository>();
builder.Services.AddScoped<HistoricalDataService>();
builder.Services.AddScoped<CryptoDataRepository>();
builder.Services.AddScoped<UserPreferencesRepository>();
builder.Services.AddScoped<UserPreferencesService>();
builder.Services.AddCors(options =>
{
    options.AddDefaultPolicy(policy =>
    {
        policy.WithOrigins("http://localhost:3000") // Your frontend's URL
              .AllowAnyHeader()
              .AllowAnyMethod();
    });
});

var app = builder.Build();

// Configure the HTTP request pipeline
if (app.Environment.IsDevelopment())
{
    // Enable Swagger in Development
    app.UseSwagger();
    app.UseSwaggerUI(c =>
    {
        c.SwaggerEndpoint("/swagger/v1/swagger.json", "CryptoAnalyticsAPI v1");
        c.RoutePrefix = string.Empty; // Serve Swagger UI at the root (http://localhost:5000)
    });
}

app.UseCors();
// Add Middleware
app.UseAuthorization();

// Map Controllers
app.MapControllers();

// Map SignalR Hubs
app.MapHub<CryptoAnalyticsAPI.Hubs.CryptoDataHub>("/cryptoDataHub");
// Run the application
app.Run();
