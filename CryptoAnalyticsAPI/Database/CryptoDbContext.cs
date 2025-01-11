using Microsoft.EntityFrameworkCore;
using CryptoAnalyticsAPI.Models;

namespace CryptoAnalyticsAPI.Database
{
    public class CryptoDbContext : DbContext
    {
        public CryptoDbContext(DbContextOptions<CryptoDbContext> options) : base(options) { }

        public DbSet<CryptoHistoryData> CryptoHistoryData { get; set; } // Add this for historical data

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // Configure CryptoHistoryData table if needed
            modelBuilder.Entity<CryptoHistoryData>().HasKey(h => h.Id);
        }
    }
}
