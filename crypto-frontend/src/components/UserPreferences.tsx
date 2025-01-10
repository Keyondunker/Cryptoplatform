import React, { useState } from "react";

interface UserPreference {
  symbol: string; // Cryptocurrency symbol (e.g., BTC)
  name: string;   // Cryptocurrency name (e.g., Bitcoin)
}

const UserPreferences: React.FC = () => {
  const [preferences, setPreferences] = useState<UserPreference[]>([]); // User preferences
  const [newPreference, setNewPreference] = useState(""); // New symbol to add

  const handleAddPreference = () => {
    if (newPreference.trim() !== "") {
      setPreferences([
        ...preferences,
        { symbol: newPreference.toUpperCase(), name: "Custom Name" },
      ]);
      setNewPreference(""); // Clear input
    }
  };

  const handleRemovePreference = (symbol: string) => {
    setPreferences(preferences.filter((pref) => pref.symbol !== symbol)); // Remove preference
  };

  return (
    <div className="user-preferences mt-5">
      <h3>User Preferences</h3>
      <div className="input-group mb-3">
        <input
          type="text"
          className="form-control"
          placeholder="Add a cryptocurrency symbol (e.g., BTC)"
          value={newPreference}
          onChange={(e) => setNewPreference(e.target.value)}
        />
        <button className="btn btn-primary" onClick={handleAddPreference}>
          Add
        </button>
      </div>
      <ul className="list-group">
        {preferences.map((pref) => (
          <li key={pref.symbol} className="list-group-item d-flex justify-content-between align-items-center">
            {pref.symbol}
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
