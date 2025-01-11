using System;
using System.Collections.Generic;
using System.Globalization;
using System.Linq;
using System.Net.Http;
using System.Runtime.ConstrainedExecution;
using System.Text.Json;
using System.Threading.Tasks;
using CryptoAnalyticsAPI.Database;
using CryptoAnalyticsAPI.Models;
using Microsoft.EntityFrameworkCore;
using System.Text.Json.Serialization;


namespace CryptoAnalyticsAPI.Services
{
    public class HistoricalDataService
    {
        private readonly HttpClient _httpClient;
        private readonly CryptoDbContext _dbContext;

        public HistoricalDataService(HttpClient httpClient, CryptoDbContext dbContext)
        {
            _httpClient = httpClient;
            _dbContext = dbContext;
        }

        /// <summary>
        /// Fetch historical data for a specific cryptocurrency from CoinGecko.
        /// </summary>
        /// <param name="symbol">Cryptocurrency symbol (e.g., BTC).</param>
        /// <param name="name">Cryptocurrency name (e.g., Bitcoin).</param>
        /// <param name="days">Number of days of historical data to fetch.</param>
        /// <returns>List of CryptoHistoryData representing the historical data.</returns>
        /// 

        private async Task<string> FetchDataWithRetryAsync(string url, int maxRetries = 3)
        {
            for (int attempt = 1; attempt <= maxRetries; attempt++)
            {
                try
                {
                    var response = await _httpClient.GetAsync(url);
                    response.EnsureSuccessStatusCode();
                    return await response.Content.ReadAsStringAsync();
                }
                catch (HttpRequestException ex) when (attempt < maxRetries)
                {
                    Console.WriteLine($"Retry {attempt} for URL: {url} due to error: {ex.Message}");
                    await Task.Delay(2000); // Delay between retries
                }
            }
            throw new Exception("Failed to fetch data after retries.");
        }

        public async Task<List<CryptoHistoryData>> GetHistoricalDataAsync(string symbol, int days = 30)
        {
            var mappedId = await MapSymbolToIdAsync(symbol);
            Console.WriteLine("Id is like this!");
            Console.WriteLine(mappedId);
            if (string.IsNullOrEmpty(mappedId))
            {
                throw new Exception($"Unable to map symbol {symbol} to a valid CoinGecko ID.");
            }

            var url = $"https://api.coingecko.com/api/v3/coins/{mappedId}/market_chart?vs_currency=usd&days={days}";
            var historicalData = new List<CryptoHistoryData>();

            try
            {
                // Add the User-Agent header to the request
                _httpClient.DefaultRequestHeaders.Clear();
                _httpClient.DefaultRequestHeaders.Add("User-Agent", "CryptoAnalyticsAPI/1.0");
                // Parse the response JSON
                var content = await FetchDataWithRetryAsync(url);
                var options = new JsonSerializerOptions
                {
                    PropertyNameCaseInsensitive = true
                };

                var json = JsonSerializer.Deserialize<CoinGeckoHistoricalData>(content, options); 
                if (json == null || json.Prices == null)
                {
                    throw new Exception("No historical data returned from CoinGecko API.");
                }
                Console.WriteLine("Success! JT");
                // Convert CoinGecko data to CryptoHistoryData
                for (int i = 0; i < json.Prices.Count; i++)
                {
                    historicalData.Add(new CryptoHistoryData
                    {
                        Symbol = symbol.ToUpper(),
                        Date = DateTimeOffset.FromUnixTimeMilliseconds((long)json.Prices[i][0]).UtcDateTime,
                        Price = (decimal)json.Prices[i][1],
                        MarketCap = i < json.MarketCaps.Count ? (decimal)json.MarketCaps[i][1] : 0,
                        Volume24h = i < json.TotalVolumes.Count ? (decimal)json.TotalVolumes[i][1] : 0
                    });
                }
            }
            catch (HttpRequestException ex)
            {
                Console.WriteLine($"Error fetching historical data from CoinGecko: {ex.Message}");
                throw new Exception("Failed to fetch historical data. Please check your network.");
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Unexpected error: {ex.Message}");
                throw;
            }

            return historicalData;
        }

        /// <summary>
        /// Save historical data to the database.
        /// </summary>
        /// <param name="symbol">Cryptocurrency symbol.</param>
        /// <param name="historicalData">Historical data to save.</param>
        public async Task SaveHistoricalDataAsync(string symbol, List<CryptoHistoryData> historicalData)
        {
            try
            {
                // Remove existing historical data for the same symbol
                var existingData = await _dbContext.CryptoHistoryData
                    .Where(h => h.Symbol == symbol)
                    .ToListAsync();
                _dbContext.CryptoHistoryData.RemoveRange(existingData);

                // Add new historical data
                await _dbContext.CryptoHistoryData.AddRangeAsync(historicalData);

                // Save changes to the database
                await _dbContext.SaveChangesAsync();
                Console.WriteLine($"Successfully saved {historicalData.Count} records for {symbol}.");
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error saving historical data: {ex.Message}");
                throw;
            }
        }

        /// <summary>
        /// Retrieve historical data for a specific cryptocurrency from the database.
        /// </summary>
        /// <param name="symbol">Cryptocurrency symbol.</param>
        /// <returns>List of CryptoHistoryData.</returns>
        public async Task<List<CryptoHistoryData>> GetHistoricalDataAsync(string symbol)
        {
            try
            {
                return await _dbContext.CryptoHistoryData
                    .Where(h => h.Symbol == symbol)
                    .OrderBy(h => h.Date)
                    .ToListAsync();
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error retrieving historical data: {ex.Message}");
                throw;
            }
        }

        /// <summary>
        /// Map cryptocurrency symbol to CoinGecko ID.
        /// </summary>
        /// <param name="symbol">Cryptocurrency symbol (e.g., BTC).</param>
        /// <returns>CoinGecko ID for the given symbol.</returns>
        private async Task<string> MapSymbolToIdAsync(string symbol)
        {
            try
            {
                // Fetch the list of coins from CoinGecko
                var url = "https://api.coingecko.com/api/v3/coins/list";
                _httpClient.DefaultRequestHeaders.Clear();
                _httpClient.DefaultRequestHeaders.Add("User-Agent", "CryptoAnalyticsAPI/1.0");

                var response = await _httpClient.GetAsync(url);
                response.EnsureSuccessStatusCode();

                var content = await response.Content.ReadAsStringAsync();
                var coins = JsonSerializer.Deserialize<List<CoinGeckoCoin>>(content);

                if (coins == null || !coins.Any())
                {
                    throw new Exception("Failed to fetch the list of coins from CoinGecko.");
                }

                // Find the matching coin by symbol
                var matchingCoins = coins.Where(c => c.Symbol?.Equals(symbol, StringComparison.OrdinalIgnoreCase) == true).ToList();
                if (matchingCoins.Count == 0)
                {
                    Console.WriteLine($"No coin found for symbol: {symbol}");
                    return null;
                }
                // Log found coins
                Console.WriteLine($"Coins matched for {symbol}: {string.Join(", ", matchingCoins.Select(c => $"{c.Symbol}:{c.Id}"))}");

                return matchingCoins.FirstOrDefault()?.Id;
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error fetching CoinGecko coin list: {ex.Message}");
                throw;
            }
        }
        // Model for CoinGecko /coins/list endpoint response
        private class CoinGeckoCoin
        {   
            [JsonPropertyName("id")]
            public string Id { get; set; }     // CoinGecko ID
            [JsonPropertyName("symbol")]
            public string Symbol { get; set; } // Cryptocurrency symbol (e.g., BTC)
            [JsonPropertyName("name")]
            public string Name { get; set; }   // Cryptocurrency name (e.g., Bitcoin)
        }        
        private class CoinGeckoHistoricalData
        {
            [JsonPropertyName("prices")]
            public List<List<double>> Prices { get; set; }      // [Timestamp, Price]

            [JsonPropertyName("market_caps")]
            public List<List<double>> MarketCaps { get; set; }  // [Timestamp, MarketCap]

            [JsonPropertyName("total_volumes")]
            public List<List<double>> TotalVolumes { get; set; } // [Timestamp, Volume]
        }
    }
}
