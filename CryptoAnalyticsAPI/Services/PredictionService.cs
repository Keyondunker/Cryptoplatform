using System.Net.Http;
using System.Text.Json;
using System.Threading.Tasks;

public class PredictionService
{
    private readonly HttpClient _httpClient;

    public PredictionService(HttpClient httpClient)
    {
        _httpClient = httpClient;
    }

    public async Task<decimal> PredictPrice(decimal marketCap, decimal volume24h, decimal _price)
    {
        var request = new
        {
            market_cap = marketCap,
            volume_24h = volume24h,
            price = _price
        };

        var response = await _httpClient.PostAsJsonAsync("http://127.0.0.1:8000/predict", request);
        response.EnsureSuccessStatusCode();
        var json = await response.Content.ReadAsStringAsync();

        var result = JsonSerializer.Deserialize<PredictionResponse>(json);
        return result.PredictedPrice;
    }
}

public class PredictionResponse
{
    public decimal PredictedPrice { get; set; }
}
