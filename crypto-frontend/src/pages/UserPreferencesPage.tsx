import React, { useState } from 'react';

interface UserPreference {
    id: number;
    userId: string;
    symbol: string;
}

const UserPreferencesPage: React.FC = () => {
    const [preferences, setPreferences] = useState<UserPreference[]>([]);
    const [newPreference, setNewPreference] = useState('');

    const handleAddPreference = () => {
        // Call API to save preference
        const newPref = { id: Date.now(), userId: '123', symbol: newPreference };
        setPreferences([...preferences, newPref]);
        setNewPreference('');
    };

    const handleRemovePreference = (id: number) => {
        // Call API to remove preference
        setPreferences(preferences.filter(pref => pref.id !== id));
    };

    return (
        <div>
            <h1>User Preferences</h1>
            <input
                type="text"
                placeholder="Add a cryptocurrency symbol"
                value={newPreference}
                onChange={(e) => setNewPreference(e.target.value)}
            />
            <button onClick={handleAddPreference}>Add</button>
            <ul>
                {preferences.map(pref => (
                    <li key={pref.id}>
                        {pref.symbol}
                        <button onClick={() => handleRemovePreference(pref.id)}>Remove</button>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default UserPreferencesPage;

