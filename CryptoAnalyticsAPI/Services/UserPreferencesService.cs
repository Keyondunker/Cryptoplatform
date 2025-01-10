using CryptoAnalyticsAPI.Models;
using CryptoAnalyticsAPI.Repositories;
using System.Collections.Generic;

namespace CryptoAnalyticsAPI.Services
{
    public class UserPreferencesService
    {
        private readonly UserPreferencesRepository _userPreferencesRepository;

        public UserPreferencesService(UserPreferencesRepository userPreferencesRepository)
        {
            _userPreferencesRepository = userPreferencesRepository;
        }

        public List<UserPreference> GetUserPreferences(string userId)
        {
            return _userPreferencesRepository.GetUserPreferences(userId);
        }

        public void AddUserPreference(UserPreference preference)
        {
            _userPreferencesRepository.AddUserPreference(preference);
        }

        public void RemoveUserPreference(UserPreference preference)
        {
            _userPreferencesRepository.RemoveUserPreference(preference);
        }
    }
}
