using CryptoAnalyticsAPI.Models;
using CryptoAnalyticsAPI.Database;
using System.Collections.Generic;
using System.Linq;

namespace CryptoAnalyticsAPI.Repositories
{
    public class HistoricalDataRepository
    {
        private readonly AppDbContext _context;

        public HistoricalDataRepository(AppDbContext context)
        {
            _context = context;
        }

        public void SaveHistoricalData(List<CryptoHistoryData> data)
        {
            _context.CryptoHistory.AddRange(data);
            _context.SaveChanges();
        }

        public List<CryptoHistoryData> GetHistoricalData(string symbol)
        {
            return _context.CryptoHistory
                .Where(h => h.Symbol == symbol)
                .OrderBy(h => h.Date)
                .ToList();
        }
    }
}

