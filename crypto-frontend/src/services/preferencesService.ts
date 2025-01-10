export const savePreferenceLocally = (preferences: any[]) => {
    localStorage.setItem("userPreferences", JSON.stringify(preferences));
  };
  
  export const getPreferencesLocally = (): any[] => {
    const data = localStorage.getItem("userPreferences");
    return data ? JSON.parse(data) : [];
  };
  