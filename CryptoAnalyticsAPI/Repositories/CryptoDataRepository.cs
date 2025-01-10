using CryptoAnalyticsAPI.Models;
using CryptoAnalyticsAPI.Database;
using System.Collections.Generic;
using System.Linq;

namespace CryptoAnalyticsAPI.Repositories
{
    public class CryptoDataRepository
    {
        private readonly AppDbContext _context;

        public CryptoDataRepository(AppDbContext context)
        {
            _context = context;
        }

        public void SaveCryptoData(List<CryptoData> cryptoData)
        {
            _context.CryptoData.AddRange(cryptoData);
            _context.SaveChanges();
        }

        public List<CryptoData> GetCryptoData()
        {
            return _context.CryptoData.ToList();
        }
    }
}
