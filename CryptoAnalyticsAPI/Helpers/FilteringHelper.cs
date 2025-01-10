using CryptoAnalyticsAPI.Models;
using System.Collections.Generic;
using System.Linq;

namespace CryptoAnalyticsAPI.Helpers
{
    public static class FilteringHelper
    {
        public static List<CryptoData> FilterCryptoData(List<CryptoData> data, string filter)
        {
            return data.Where(c => 
                c.Symbol.Contains(filter, System.StringComparison.OrdinalIgnoreCase) ||
                c.Name.Contains(filter, System.StringComparison.OrdinalIgnoreCase))
                .ToList();
        }
    }
}
