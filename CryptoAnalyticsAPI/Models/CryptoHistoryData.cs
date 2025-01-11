namespace CryptoAnalyticsAPI.Models
{
    public class CryptoHistoryData
    {
        public int Id { get; set; }                 // Primary key
        public string? Symbol { get; set; }          // e.g., BTC
        public string? Name { get; set; } 
        public DateTime Date { get; set; }          // Date of historical data
        public decimal Price { get; set; }          // Price in USD
        public decimal MarketCap { get; set; }      // Market cap in USD
        public decimal Volume24h { get; set; }      // 24-hour volume in USD

    }
}
