using Microsoft.AspNetCore.Mvc;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using CryptoAnalyticsAPI.Models;
using Microsoft.VisualBasic;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly IConfiguration _configuration;
    string testUsername = "testuser";
    string testPassword = "password123";
    // Mock user database (replace with real DB)
    private readonly Dictionary<string, string> _users = new()
    {
        { "john_doe", "securepassword" } // username: password
    };

    public AuthController(IConfiguration configuration)
    {
        _configuration = configuration;
    }

    [HttpPost("login")]
    public IActionResult Login([FromBody] UserLogin login)
    {
        // // Validate user
        // if (!_users.ContainsKey(login.Username) || _users[login.Username] != login.Password)
        // {
    
        //     return Unauthorized("Invalid username or password.");
        // }
        if (login.Username == testUsername && login.Password == testPassword){
            // Generate tokens
            var accessToken = GenerateToken(login.Username);
            var refreshToken = Guid.NewGuid().ToString(); // Mock refresh token

            return Ok(new AuthResponse { AccessToken = accessToken, RefreshToken = refreshToken });
        }

        return Unauthorized("Invalid username or password.");
        
    }

    private string GenerateToken(string username)
    {
        var jwtSettings = _configuration.GetSection("JwtSettings");
        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtSettings["Secret"]));
        var credentials = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

        var claims = new[]
        {
            new Claim(JwtRegisteredClaimNames.Sub, username),
            new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString())
        };

        var token = new JwtSecurityToken(
            issuer: jwtSettings["Issuer"],
            audience: jwtSettings["Audience"],
            claims: claims,
            expires: DateTime.Now.AddMinutes(int.Parse(jwtSettings["ExpiryMinutes"])),
            signingCredentials: credentials);

        return new JwtSecurityTokenHandler().WriteToken(token);
    }
}
