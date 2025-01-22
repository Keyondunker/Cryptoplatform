using System;
using System.Collections.Generic;
using System.Net.Http;
using System.Threading.Tasks;
using Microsoft.Extensions.Configuration;
using Newtonsoft.Json.Linq;
using CryptoAnalyticsAPI.Models;

namespace CryptoAnalyticsAPI.Services
{
    public class CoinMarketCapService
    {
        private readonly HttpClient _httpClient;

        // Constructor: Inject HttpClient
        public CoinMarketCapService(HttpClient httpClient)
        {
            _httpClient = httpClient;
        }

        // Fetch Latest Cryptocurrency Data
        public async Task<List<CryptoData>> GetLatestCryptoDataAsync()
        {
            var url = "https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd";
            var cryptoList = new List<CryptoData>();

            try
            {
                 // Add the User-Agent header to the request
                _httpClient.DefaultRequestHeaders.Clear();
                _httpClient.DefaultRequestHeaders.Add("User-Agent", "CryptoAnalyticsAPI/1.0");

                // Make the HTTP GET request
                var response = await _httpClient.GetAsync(url);

                // Ensure the response was successful
                response.EnsureSuccessStatusCode();

                // Read and parse the response JSON
                var content = await response.Content.ReadAsStringAsync();
                var json = JArray.Parse(content);

                // Extract and parse the cryptocurrency data
                foreach (var item in json)
                {
                    try
                    {
                        cryptoList.Add(new CryptoData
                        {
                            Symbol = item["symbol"].ToString().ToUpper(),
                            Name = item["name"].ToString(),
                            Price = Decimal.Parse(item["current_price"].ToString(), System.Globalization.NumberStyles.Float, System.Globalization.CultureInfo.InvariantCulture),
                            MarketCap = Decimal.Parse(item["market_cap"].ToString(), System.Globalization.NumberStyles.Float, System.Globalization.CultureInfo.InvariantCulture),
                            Volume24h = Decimal.Parse(item["total_volume"].ToString(), System.Globalization.NumberStyles.Float, System.Globalization.CultureInfo.InvariantCulture),
                            UpdatedAt = DateTime.Parse(item["last_updated"].ToString())
                        });
                    }
                    catch (Exception ex)
                    {
                        // Log and skip problematic entries
                        Console.WriteLine($"Error parsing data for {item["symbol"]}: {ex.Message}");
                    }
                }
            }
            catch (HttpRequestException ex)
            {
                // Log HTTP request errors
                Console.WriteLine($"Error fetching data from CoinGecko: {ex.Message}");
                throw new Exception("Failed to fetch cryptocurrency data. Please check your network.");
            }
            catch (Exception ex)
            {
                // Log any other exceptions
                Console.WriteLine($"Unexpected error: {ex.Message}");
                throw;
            }

            return cryptoList;
        }

             // Fetch details for a specific cryptocurrency by name
        public async Task<CryptoData> GetCryptoDetailsByName(string name)
        {
            var url = $"https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids={name.ToLower()}";

            try
            {
                // Add the User-Agent header to the request
                _httpClient.DefaultRequestHeaders.Clear();
                _httpClient.DefaultRequestHeaders.Add("User-Agent", "CryptoAnalyticsAPI/1.0");

                // Make the HTTP GET request
                var response = await _httpClient.GetAsync(url);

                // Ensure the response was successful
                response.EnsureSuccessStatusCode();

                // Read and parse the response JSON
                var content = await response.Content.ReadAsStringAsync();
                var json = JArray.Parse(content);

                if (json.Count > 0)
                {
                    var item = json[0];
                    return new CryptoData
                    {
                        Symbol = item["symbol"].ToString().ToUpper(),
                        Name = item["name"].ToString(),
                        Price = Decimal.Parse(item["current_price"].ToString(), System.Globalization.NumberStyles.Float, System.Globalization.CultureInfo.InvariantCulture),
                        MarketCap = Decimal.Parse(item["market_cap"].ToString(), System.Globalization.NumberStyles.Float, System.Globalization.CultureInfo.InvariantCulture),
                        Volume24h = Decimal.Parse(item["total_volume"].ToString(), System.Globalization.NumberStyles.Float, System.Globalization.CultureInfo.InvariantCulture),
                        UpdatedAt = DateTime.Parse(item["last_updated"].ToString())
                    };
                }
                else
                {
                    throw new Exception($"No data found for cryptocurrency '{name}'.");
                }
            }
            catch (HttpRequestException ex)
            {
                // Log HTTP request errors
                Console.WriteLine($"Error fetching details from CoinGecko for {name}: {ex.Message}");
                throw new Exception($"Failed to fetch data for {name}. Please check the cryptocurrency name and try again.");
            }
            catch (Exception ex)
            {
                // Log any other exceptions
                Console.WriteLine($"Unexpected error: {ex.Message}");
                throw;
            }
        }

  
    }
}
