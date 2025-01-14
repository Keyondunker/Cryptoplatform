import pandas as pd
import numpy as np
from sklearn.ensemble import RandomForestRegressor
from sklearn.model_selection import train_test_split
import pickle

class CryptoModel:
    def __init__(self):
        self.model = None

    def train(self, historical_data: pd.DataFrame):
        """
        Train the AI model using historical data.
        """
        # Preprocess data
        X = historical_data[['market_cap', 'volume_24h', 'price']].values
        y = historical_data['price'].shift(-1).fillna(method='ffill').values

        # Split data
        X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

        # Train model
        self.model = RandomForestRegressor(n_estimators=100, random_state=42)
        self.model.fit(X_train, y_train)

    def predict(self, input_data: np.array):
        """
        Predict the next price given input features.
        """
        return self.model.predict([input_data])

    def save_model(self, filepath: str):
        """
        Save the model to a file.
        """
        with open(filepath, 'wb') as f:
            pickle.dump(self.model, f)

    def load_model(self, filepath: str):
        """
        Load the model from a file.
        """
        with open(filepath, 'rb') as f:
            self.model = pickle.load(f)
