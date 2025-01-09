namespace CryptoAnalyticsAPI.Models
{
    public class CryptoData
    {
        public string? Symbol { get; set; }
        public string? Name { get; set; }
        public decimal Price { get; set; }
        public decimal MarketCap { get; set; }
        public decimal Volume24h { get; set; }
    }
}
