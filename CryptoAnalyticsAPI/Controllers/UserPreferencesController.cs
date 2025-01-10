using Microsoft.AspNetCore.Mvc;
using CryptoAnalyticsAPI.Services;
using CryptoAnalyticsAPI.Models;

namespace CryptoAnalyticsAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class UserPreferencesController : ControllerBase
    {
        private readonly UserPreferencesService _userPreferencesService;

        public UserPreferencesController(UserPreferencesService userPreferencesService)
        {
            _userPreferencesService = userPreferencesService;
        }

        // GET /api/userpreferences/{userId}
        [HttpGet("{userId}")]
        public IActionResult GetUserPreferences(string userId)
        {
            var preferences = _userPreferencesService.GetUserPreferences(userId);
            return Ok(preferences);
        }

        // POST /api/userpreferences
        [HttpPost]
        public IActionResult AddUserPreference([FromBody] UserPreference preference)
        {
            if (preference == null || string.IsNullOrEmpty(preference.UserId) || string.IsNullOrEmpty(preference.Symbol))
            {
                return BadRequest("Invalid preference data.");
            }

            _userPreferencesService.AddUserPreference(preference);
            return Ok("Preference added successfully.");
        }

        // DELETE /api/userpreferences
        [HttpDelete]
        public IActionResult RemoveUserPreference([FromBody] UserPreference preference)
        {
            if (preference == null || string.IsNullOrEmpty(preference.UserId) || string.IsNullOrEmpty(preference.Symbol))
            {
                return BadRequest("Invalid preference data.");
            }

            _userPreferencesService.RemoveUserPreference(preference);
            return Ok("Preference removed successfully.");
        }
    }
}
