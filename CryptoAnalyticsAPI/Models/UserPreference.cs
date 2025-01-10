namespace CryptoAnalyticsAPI.Models
{
    public class UserPreference
    {
        public int Id { get; set; }               // Primary key
        public string? UserId { get; set; }        // User identifier (e.g., email or GUID)
        public string? Symbol { get; set; }        // Cryptocurrency symbol (e.g., BTC)
    }
}
