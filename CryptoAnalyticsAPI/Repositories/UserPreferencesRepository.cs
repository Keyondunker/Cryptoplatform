using CryptoAnalyticsAPI.Models;
using CryptoAnalyticsAPI.Database;
using System.Collections.Generic;
using System.Linq;

namespace CryptoAnalyticsAPI.Repositories
{
    public class UserPreferencesRepository
    {
        private readonly AppDbContext _context;

        public UserPreferencesRepository(AppDbContext context)
        {
            _context = context;
        }

        public List<UserPreference> GetUserPreferences(string userId)
        {
            return _context.UserPreferences.Where(up => up.UserId == userId).ToList();
        }

        public void AddUserPreference(UserPreference preference)
        {
            _context.UserPreferences.Add(preference);
            _context.SaveChanges();
        }

        public void RemoveUserPreference(UserPreference preference)
        {
            _context.UserPreferences.Remove(preference);
            _context.SaveChanges();
        }
    }
}
