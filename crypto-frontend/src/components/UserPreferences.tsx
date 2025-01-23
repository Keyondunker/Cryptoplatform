import React, { useState, useEffect } from "react";
import axios from "axios";

// Define the user preference interface
interface UserPreference {
  symbol: string;  // Cryptocurrency symbol (e.g., BTC)
  name: string;    // Cryptocurrency name (e.g., Bitcoin)
  minPrice: number;  // Minimum price threshold
  maxPrice: number;  // Maximum price threshold
  alertType: "popup" | "email" | "sound";  // Alert type preference
}

// Load saved preferences from localStorage
const loadPreferences = () => {
  const saved = localStorage.getItem("cryptoPreferences");
  return saved ? JSON.parse(saved) : [];
};

const UserPreferences: React.FC = () => {
  const [preferences, setPreferences] = useState<UserPreference[]>(loadPreferences());
  const [newSymbol, setNewSymbol] = useState("");
  const [minPrice, setMinPrice] = useState<number | string>("");
  const [maxPrice, setMaxPrice] = useState<number | string>("");
  const [alertType, setAlertType] = useState<string>("popup");  // Default alert type

  // Save preferences to localStorage
  useEffect(() => {
    localStorage.setItem("cryptoPreferences", JSON.stringify(preferences));
  }, [preferences]);

  // Function to add a new preference
  const handleAddPreference = () => {
    if (newSymbol.trim() !== "" && minPrice !== "" && maxPrice !== "") {
      setPreferences([
        ...preferences,
        {
          symbol: newSymbol.toUpperCase(),
          name: newSymbol.toUpperCase(),
          minPrice: Number(minPrice),
          maxPrice: Number(maxPrice),
          alertType: alertType as "popup" | "email" | "sound",
        },
      ]);
      setNewSymbol("");
      setMinPrice("");
      setMaxPrice("");
    }
  };

  // Function to remove a preference
  const handleRemovePreference = (symbol: string) => {
    setPreferences(preferences.filter((pref) => pref.symbol !== symbol));
  };

  // Function to check prices and trigger alerts
  const checkPrices = async () => {
    try {
      const symbols = preferences.map((pref) => pref.symbol.toLowerCase()).join(",");
      if (!symbols) return;

      const response = await axios.get(`https://api.coingecko.com/api/v3/simple/price?ids=${symbols}&vs_currencies=usd`);
      const priceData = response.data;
      console.log("Price data: ", priceData);

      preferences.forEach((pref) => {
        const currentPrice = priceData[pref.symbol.toLowerCase()]?.usd;

        if (currentPrice) {
          if (currentPrice < pref.minPrice || currentPrice > pref.maxPrice) {
            triggerAlert(pref, currentPrice);
          }
        }
      });
    } catch (error) {
      console.error("Error fetching crypto prices:", error);
    }
  };

  // Function to trigger alerts based on user preferences
  const triggerAlert = (pref: UserPreference, currentPrice: number) => {
    const message = `Alert: ${pref.symbol} is out of range! Current price: $${currentPrice}`;

    if (pref.alertType === "popup") {
      alert(message);
    } else if (pref.alertType === "email") {
      console.log(`Email sent to user for ${pref.symbol}.`);
    } else if (pref.alertType === "sound") {
      const audio = new Audio("/alert-sound.mp3");
      audio.play();
    }
  };

  // Periodically check prices based on a user-configurable interval
  useEffect(() => {
    const interval = setInterval(() => {
      checkPrices();
    }, 30000);  // Check every 30 seconds

    return () => clearInterval(interval);
  }, [preferences]);

  return (
    <div className="user-preferences mt-5">
      <h3>User Preferences</h3>
      <div className="input-group mb-3">
        <input
          type="text"
          className="form-control"
          placeholder="Enter cryptocurrency symbol (e.g., BTC)"
          value={newSymbol}
          onChange={(e) => setNewSymbol(e.target.value)}
        />
        <input
          type="number"
          className="form-control"
          placeholder="Min Price"
          value={minPrice}
          onChange={(e) => setMinPrice(e.target.value)}
        />
        <input
          type="number"
          className="form-control"
          placeholder="Max Price"
          value={maxPrice}
          onChange={(e) => setMaxPrice(e.target.value)}
        />
        <select
          className="form-select"
          value={alertType}
          onChange={(e) => setAlertType(e.target.value)}
        >
          <option value="popup">Popup Alert</option>
          <option value="email">Email Alert</option>
          <option value="sound">Sound Alert</option>
        </select>
        <button className="btn btn-primary" onClick={handleAddPreference}>
          Add
        </button>
      </div>

      <ul className="list-group">
        {preferences.map((pref) => (
          <li key={pref.symbol} className="list-group-item d-flex justify-content-between align-items-center">
            {pref.symbol} (Min: ${pref.minPrice}, Max: ${pref.maxPrice}) - Alert: {pref.alertType}
            <button className="btn btn-danger btn-sm" onClick={() => handleRemovePreference(pref.symbol)}>
              Remove
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default UserPreferences;
