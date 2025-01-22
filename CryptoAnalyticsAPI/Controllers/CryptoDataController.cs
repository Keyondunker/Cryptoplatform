using Microsoft.AspNetCore.Mvc;
using System.Threading.Tasks;
using CryptoAnalyticsAPI.Services;
using CryptoAnalyticsAPI.Hubs;
using CryptoAnalyticsAPI.Repositories;
using Microsoft.AspNetCore.SignalR;
using CryptoAnalyticsAPI.Helpers;
using CryptoAnalyticsAPI.Models;
using System.Text.Json;
using System.Text;
using System.Collections.Generic;
using System.Linq;
using Microsoft.AspNetCore.Authorization;

namespace CryptoAnalyticsAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class CryptoDataController : ControllerBase
    {
        private readonly CoinMarketCapService _cryptoService;
        private readonly IHubContext<CryptoDataHub> _hubContext;
        private readonly HistoricalDataService _historicalDataService;
        private readonly CryptoDataRepository _cryptoDataRepository;
        private readonly PredictionService _predictionService;

        public CryptoDataController(CoinMarketCapService cryptoService, IHubContext<CryptoDataHub> hubContext, HistoricalDataService historicalDataService, PredictionService predictionService, CryptoDataRepository cryptoDataRepository)
        {
            _cryptoService = cryptoService;
            _hubContext = hubContext;
            _historicalDataService = historicalDataService;
            _cryptoDataRepository = cryptoDataRepository;
            _predictionService = predictionService;
        }

        [HttpGet]

        public async Task<IActionResult> GetCryptoData(int page = 1, int limit = 250, string sort = "name", string filter = "")
        {
            var cryptoData = await _cryptoService.GetLatestCryptoDataAsync();

            // Apply filtering
            if (!string.IsNullOrEmpty(filter))
            {
                cryptoData = FilteringHelper.FilterCryptoData(cryptoData, filter);
            }

            // Apply sorting
            cryptoData = SortingHelper.SortCryptoData(cryptoData, sort);

            // Apply pagination
            var pagedData = PaginationHelper.Paginate(cryptoData, page, limit);

            // Broadcast data to all SignalR clients
            await _hubContext.Clients.All.SendAsync("ReceiveCryptoData", pagedData);

            return Ok(pagedData);
        }

        [HttpGet("details")]
        public async Task<IActionResult> GetCryptoDetails(string name){
            try
            {
                // Await the asynchronous method to fetch the cryptocurrency details
                var currentCrypto = await _cryptoService.GetCryptoDetailsByName(name);

                if (currentCrypto == null)
                {
                    return NotFound("Cryptocurrency details not found.");
                }

                // Return the required fields in the response
                return Ok(new
                {
                    marketCap = currentCrypto.MarketCap,
                    volume24h = currentCrypto.Volume24h
                });
            }
            catch (Exception ex)
            {
                // Return a BadRequest response with the error message
                return BadRequest(new { error = ex.Message });
            }
        }
        
      
        // GET /api/cryptodata/history?symbol=BTC&name=Bitcoin
        [HttpGet("history")]
        public async Task<IActionResult> GetHistoricalData(string symbol, int days = 30)
        {
            if (string.IsNullOrEmpty(symbol))
            {
                return BadRequest("Symbol is required.");
            }

            // Fetch historical data from the database
            var historicalData = await _historicalDataService.GetHistoricalDataAsync(symbol);

            if (historicalData == null || !historicalData.Any() || historicalData.Count < days)
            {
                var updatedData = await _historicalDataService.GetHistoricalDataAsync(symbol, days);
                await _historicalDataService.SaveHistoricalDataAsync(symbol, updatedData);
                // If no data is found in the database, fetch from CoinGecko and save it
                historicalData = updatedData;
            }

            // Prepare data for chart rendering (sorted by date)
            var formattedData = historicalData
                .OrderBy(data => data.Date) // Ensure chronological order
                .Select(data => new
                {
                    Date = data.Date.ToString("yyyy-MM-dd"), // Format date as string
                    Price = data.Price,
                    MarketCap = data.MarketCap,
                    Volume24h = data.Volume24h
                });

            return Ok(formattedData);
        }

        // POST /api/cryptodata/history/save
        [HttpPost("history/save")]
        public async Task<IActionResult> SaveHistoricalData([FromBody] List<CryptoHistoryData> historicalData)
        {
            if (historicalData == null || !historicalData.Any())
            {
                return BadRequest("Historical data is required.");
            }

            // Save historical data
            await _historicalDataService.SaveHistoricalDataAsync(historicalData.First().Symbol, historicalData);

            return Ok("Historical data saved successfully.");
        }
    
        [HttpPost("predict")]
        public async Task<IActionResult> PredictPrice([FromBody] CryptoData cryptoData)
        {
            var prediction = await _predictionService.PredictPrice(cryptoData.MarketCap, cryptoData.Volume24h, cryptoData.Price);
            return Ok(new { PredictedPrice = prediction });
        }
        [HttpPost("train-model")]
        public async Task<IActionResult> TrainModel(string _Name, int days = 30)
        {

            try
            {
                var historicalData = await _historicalDataService.FetchHistoricalDataForPythonAsync(_Name, days);

                var requestData = historicalData.Select(data => new
                {
                    Date = data.Date.ToString("yyyy-MM-dd"),
                    Price = data.Price,
                    MarketCap = data.MarketCap,
                    Volume24h = data.Volume24h
                }).ToList();
                Console.WriteLine(JsonSerializer.Serialize(requestData)); // Debugging log

                var client = new HttpClient();
                var json = JsonSerializer.Serialize(requestData); // Serialize requestData to JSON string
                var content = new StringContent(json, Encoding.UTF8, "application/json");
                // Send the POST request
                var response = await client.PostAsync("http://127.0.0.1:8000/train", content);
                if (!response.IsSuccessStatusCode)
                {
                    var errorMessage = await response.Content.ReadAsStringAsync();
                    Console.WriteLine($"Error: {response.StatusCode}, Message: {errorMessage}");
                    throw new Exception($"Failed to call AI service: {response.StatusCode}");
                }

                return Ok("Model training initiated successfully.");
            }
            catch (Exception ex)
            {
                return BadRequest($"Error: {ex.Message}");
            }
        }




        // POST /api/cryptodata/cache
        [HttpPost("cache")]
        public IActionResult SaveCryptoData([FromBody] List<CryptoData> cryptoData)
        {
            if (cryptoData == null || !cryptoData.Any())
            {
                return BadRequest("Crypto data is required.");
            }

            _cryptoDataRepository.SaveCryptoData(cryptoData);

            return Ok("Crypto data cached successfully.");
        }

        // GET /api/cryptodata/cache
        [HttpGet("cache")]
        public IActionResult GetCachedCryptoData()
        {
            var cachedData = _cryptoDataRepository.GetCryptoData();
            return Ok(cachedData);
        }
    }
}
