import requests
import pandas as pd
import os

# Function to fetch crypto data from CoinGecko API
def fetch_crypto_data(crypto_id='bitcoin', currency='usd', days=30):
    url = f'https://api.coingecko.com/api/v3/coins/{crypto_id}/market_chart'
    params = {
        'vs_currency': currency,
        'days': days,
        'interval': 'daily'
    }

    try:
        response = requests.get(url, params=params)
        data = response.json()

        if 'prices' not in data:
            raise Exception("Error fetching data from CoinGecko API")

        # Prepare data for DataFrame
        records = []
        for i in range(len(data['prices'])):
            records.append({
                'date': pd.to_datetime(data['prices'][i][0], unit='ms').date(),
                'price': data['prices'][i][1],
                'market_cap': data['market_caps'][i][1],
                'volume_24h': data['total_volumes'][i][1]
            })

        df = pd.DataFrame(records)

        # Create data directory if it doesn't exist
        if not os.path.exists("data"):
            os.makedirs("data")

        # Save to CSV file
        csv_file_path = "data/crypto_price_data.csv"
        df.to_csv(csv_file_path, index=False)
        print(f"Crypto price data saved to '{csv_file_path}'")

    except Exception as e:
        print(f"Error fetching data: {e}")

# Example call to fetch Bitcoin data for 90 days
if __name__ == "__main__":
    fetch_crypto_data('bitcoin', 'usd', days=90)
