using Microsoft.AspNetCore.Mvc;
using System.Threading.Tasks;
using CryptoAnalyticsAPI.Services;
using CryptoAnalyticsAPI.Hubs;
using CryptoAnalyticsAPI.Repositories;
using Microsoft.AspNetCore.SignalR;
using CryptoAnalyticsAPI.Helpers;
using CryptoAnalyticsAPI.Models;
using System.Collections.Generic;
using System.Linq;

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

        public CryptoDataController(CoinMarketCapService cryptoService, IHubContext<CryptoDataHub> hubContext, HistoricalDataService historicalDataService, CryptoDataRepository cryptoDataRepository)
        {
            _cryptoService = cryptoService;
            _hubContext = hubContext;
            _historicalDataService = historicalDataService;
            _cryptoDataRepository = cryptoDataRepository;
        }

        [HttpGet]
        public async Task<IActionResult> GetCryptoData(int page = 1, int limit = 20, string sort = "name", string filter = "")
        {
            var cryptoData = await _cryptoService.GetLatestCryptoDataAsync();

            // Apply filtering
            if (!string.IsNullOrEmpty(filter)){
                cryptoData = FilteringHelper.FilterCryptoData(cryptoData, filter);
            }
            
            //Applying Sorting
            cryptoData = SortingHelper.SortCryptoData(cryptoData, sort);

            //Apply pagination
            var pagedData = PaginationHelper.Paginate(cryptoData, page, limit);

            // Broadcast data to all SignalR clients
            await _hubContext.Clients.All.SendAsync("ReceiveCryptoData", pagedData);

            return Ok(pagedData);
        }
        
        // GET /api/cryptodata/history?symbol=BTC
        [HttpGet("history")]
        public IActionResult GetHistoricalData(string symbol)
        {
            if (string.IsNullOrEmpty(symbol))
            {
                return BadRequest("Symbol is required.");
            }

            // Retrieve historical data for the given symbol
            var historicalData = _historicalDataService.GetHistoricalData(symbol);

            if (historicalData == null || !historicalData.Any())
            {
                return NotFound($"No historical data found for the symbol: {symbol}");
            }
             // Prepare data for chart rendering (sorted by date)
            var formattedData = historicalData
                .OrderBy(data => data.Date) // Ensure chronological order
                .Select(data => new
                {
                    Date = data.Date.ToString("yyyy-MM-dd"), // Format date as string
                    Price = data.Price
                });
            return Ok(formattedData);
        }
        
        // POST /api/cryptodata/history/save
        [HttpPost("history/save")]
        public IActionResult SaveHistoricalData([FromBody] List<CryptoHistoryData> historicalData)
        {
            if (historicalData == null || !historicalData.Any())
            {
                return BadRequest("Historical data is required.");
            }

            // Save historical data
            _historicalDataService.SaveHistoricalData(historicalData.First().Symbol, historicalData);

            return Ok("Historical data saved successfully.");
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
