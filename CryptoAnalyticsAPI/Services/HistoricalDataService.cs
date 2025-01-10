using CryptoAnalyticsAPI.Models;
using System;
using System.Collections.Generic;
using CryptoAnalyticsAPI.Repositories;

namespace CryptoAnalyticsAPI.Services
{
    public class HistoricalDataService
    {
        private readonly HistoricalDataRepository _repository;

        public HistoricalDataService(HistoricalDataRepository repository)
        {
            _repository = repository;
        }

        public List<CryptoHistoryData> GetHistoricalData(string symbol)
        {
            return _repository.GetHistoricalData(symbol);
        }

        public void SaveHistoricalData(string symbol, List<CryptoHistoryData> data)
        {
            _repository.SaveHistoricalData(data);
        }
    }
}
