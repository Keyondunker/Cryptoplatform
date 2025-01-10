using CryptoAnalyticsAPI.Models;
using System.Collections.Generic;
using System.Linq;

namespace CryptoAnalyticsAPI.Helpers
{
    public static class SortingHelper
    {
        public static List<CryptoData> SortCryptoData(List<CryptoData> data, string sortBy)
        {
            return sortBy.ToLower() switch
            {
                "price" => data.OrderByDescending(c => c.Price).ToList(),
                "marketcap" => data.OrderByDescending(c => c.MarketCap).ToList(),
                "volume" => data.OrderByDescending(c => c.Volume24h).ToList(),
                _ => data.OrderBy(c => c.Name).ToList(), // Default: sort by name
            };
        }
    }
}
