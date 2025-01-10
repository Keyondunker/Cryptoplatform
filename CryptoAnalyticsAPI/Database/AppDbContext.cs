using CryptoAnalyticsAPI.Models;
using Microsoft.EntityFrameworkCore;

namespace CryptoAnalyticsAPI.Database
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

        public DbSet<CryptoData> CryptoData { get; set; }
        public DbSet<CryptoHistoryData> CryptoHistory { get; set; } // Historical data table
        public DbSet<UserPreference> UserPreferences { get; set; }  // User preferences
    }
}
