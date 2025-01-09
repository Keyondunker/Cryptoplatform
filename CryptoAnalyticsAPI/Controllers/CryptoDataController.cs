using Microsoft.AspNetCore.Mvc;
using System.Threading.Tasks;
using CryptoAnalyticsAPI.Services;
using CryptoAnalyticsAPI.Hubs;
using Microsoft.AspNetCore.SignalR;

namespace CryptoAnalyticsAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class CryptoDataController : ControllerBase
    {
        private readonly CoinMarketCapService _cryptoService;
        private readonly IHubContext<CryptoDataHub> _hubContext;

        public CryptoDataController(CoinMarketCapService cryptoService, IHubContext<CryptoDataHub> hubContext)
        {
            _cryptoService = cryptoService;
            _hubContext = hubContext;
        }

        [HttpGet]
        public async Task<IActionResult> GetCryptoData()
        {
            var cryptoData = await _cryptoService.GetLatestCryptoDataAsync();

            // Broadcast data to all SignalR clients
            await _hubContext.Clients.All.SendAsync("ReceiveCryptoData", cryptoData);

            return Ok(cryptoData);
        }
    }
}
