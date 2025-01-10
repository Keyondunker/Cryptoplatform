using CryptoAnalyticsAPI.Models;
using System.Collections.Generic;
using System.Linq;

namespace CryptoAnalyticsAPI.Helpers
{
    public static class PaginationHelper
    {
        public static List<CryptoData> Paginate(List<CryptoData> data, int page, int limit)
        {
            return data.Skip((page - 1) * limit).Take(limit).ToList();
        }
    }
}
