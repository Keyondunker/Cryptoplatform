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
        private readonly string _apiKey;

        // Constructor: Inject HttpClient and IConfiguration
        public CoinMarketCapService(HttpClient httpClient, IConfiguration configuration)
        {
            _httpClient = httpClient;
            _apiKey = configuration["CoinMarketCap:ApiKey"];

            if (string.IsNullOrEmpty(_apiKey))
            {
                throw new ArgumentNullException(nameof(_apiKey), "API key for CoinMarketCap is missing. Please check your configuration.");
            }
        }

        // Fetch Latest Cryptocurrency Data
        public async Task<List<CryptoData>> GetLatestCryptoDataAsync()
        {
            var url = "https://pro-api.coinmarketcap.com/v1/cryptocurrency/listings/latest";
            var cryptoList = new List<CryptoData>();

            try
            {
                // Add the API Key to request headers
                _httpClient.DefaultRequestHeaders.Clear(); // Clear any existing headers
                _httpClient.DefaultRequestHeaders.Add("X-CMC_PRO_API_KEY", _apiKey);

                // Make the HTTP GET request
                var response = await _httpClient.GetAsync(url);

                // Check for Unauthorized status (401)
                if (response.StatusCode == System.Net.HttpStatusCode.Unauthorized)
                {
                    throw new Exception("Unauthorized: Invalid API key. Please check your CoinMarketCap API key.");
                }

                // Ensure the response was successful
                response.EnsureSuccessStatusCode();

                // Read and parse the response JSON
                var content = await response.Content.ReadAsStringAsync();
                var json = JObject.Parse(content);

                // Extract and parse the cryptocurrency data
                foreach (var item in json["data"])
                {
                    try
                    {
                        cryptoList.Add(new CryptoData
                        {
                            Symbol = item["symbol"].ToString(),
                            Name = item["name"].ToString(),
                            Price = Decimal.Parse(item["quote"]["USD"]["price"].ToString(), System.Globalization.NumberStyles.Float, System.Globalization.CultureInfo.InvariantCulture),
                            MarketCap = Decimal.Parse(item["quote"]["USD"]["market_cap"].ToString(), System.Globalization.NumberStyles.Float, System.Globalization.CultureInfo.InvariantCulture),
                            Volume24h = Decimal.Parse(item["quote"]["USD"]["volume_24h"].ToString(), System.Globalization.NumberStyles.Float, System.Globalization.CultureInfo.InvariantCulture)
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
                Console.WriteLine($"Error fetching data from CoinMarketCap: {ex.Message}");
                throw new Exception("Failed to fetch cryptocurrency data. Please check your network or API key.");
            }
            catch (Exception ex)
            {
                // Log any other exceptions
                Console.WriteLine($"Unexpected error: {ex.Message}");
                throw;
            }

            return cryptoList;
        }
    }
}

