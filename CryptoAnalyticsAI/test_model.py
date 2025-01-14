from crypto_model import CryptoModel
import pandas as pd

# Sample data
data = {
    'price': [40000, 40500, 41000, 42000, 43000],
    'market_cap': [800000000, 810000000, 820000000, 830000000, 840000000],
    'volume_24h': [30000000, 31000000, 32000000, 33000000, 34000000]
}
df = pd.DataFrame(data)

model = CryptoModel()
model.train(df)

#Save the model as a file
model.save_model("crypto_model.pkl")
print("Model trained and saved as 'crypto_model.pkl'")
