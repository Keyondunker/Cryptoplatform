using Microsoft.AspNetCore.SignalR;

namespace CryptoAnalyticsAPI.Hubs
{
    public class CryptoDataHub : Hub
    {
        public async Task BroadcastCryptoData(string data)
        {
            await Clients.All.SendAsync("ReceiveCryptoData", data);
        }
    }
}
