using CryptoAnalyticsAPI.Services;
using CryptoAnalyticsAPI.Hubs;
using Serilog;
var builder = WebApplication.CreateBuilder(args);

// Add CORS policy
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowReactApp",
        builder => builder.WithOrigins("http://localhost:3000") // Allow React frontend
            .AllowAnyHeader()
            .AllowAnyMethod()
            .AllowCredentials());
});


// Add Serilog
Log.Logger = new LoggerConfiguration()
    .WriteTo.Console()
    .CreateLogger();
builder.Logging.ClearProviders();
builder.Logging.AddSerilog();

// Add services to the container.
builder.Services.AddControllersWithViews();
// Add services
builder.Services.AddControllers();
builder.Services.AddHttpClient<CoinMarketCapService>();
builder.Services.AddSignalR();
builder.Services.AddSingleton<CoinMarketCapService>();
var app = builder.Build();


// Use CORS policy
app.UseCors("AllowReactApp");
// Map routes
app.MapControllers();
app.MapHub<CryptoDataHub>("/cryptoDataHub");

// Configure the HTTP request pipeline.
if (!app.Environment.IsDevelopment())
{
    app.UseExceptionHandler("/Home/Error");
}

app.UseRouting();

app.UseAuthorization();

app.MapStaticAssets();

app.MapControllerRoute(
    name: "default",
    pattern: "{controller=Home}/{action=Index}/{id?}")
    .WithStaticAssets();


app.Run();
