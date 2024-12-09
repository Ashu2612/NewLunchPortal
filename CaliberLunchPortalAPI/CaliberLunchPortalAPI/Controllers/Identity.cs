using Microsoft.AspNetCore.Authentication.MicrosoftAccount;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using Azure.Identity;
using Microsoft.Graph;
using CaliberLunchPortalAPI.DBContext;
using CaliberLunchPortalAPI.Utilities;
using Microsoft.EntityFrameworkCore;

namespace CaliberLunchPortalAPI.Controllers
{
    [ApiController]
    [Route("[controller]")]
    public class Identity : Controller
    {
        private readonly ApplicationDbContext _context;
        private readonly IConfiguration _configuration;
        private readonly IGraphAPICalls _graphAPICalls;

        public Identity(IConfiguration configuration, ApplicationDbContext context, IGraphAPICalls graphAPICalls)
        {
            _configuration = configuration;
            _context = context;
            _graphAPICalls = graphAPICalls;
        }

        [HttpGet("LoginWithMicrosoftAccount")]
        public async void LoginWithMicrosoftAccount()
        {
            await HttpContext.ChallengeAsync(MicrosoftAccountDefaults.AuthenticationScheme,
                new AuthenticationProperties()
                {
                    RedirectUri = "/Identity/ClosePopp",
                    Parameters = { { "prompt", "select_account" } }
                });
        }

        [HttpGet("ClosePopp")]
        public async Task<IActionResult> ClosePopp()
        {
            if (User.Identity.IsAuthenticated)
            {
                string userName = User.Identity.Name;
                string userEmail = User.Claims.FirstOrDefault(c => c.Type == ClaimTypes.Email)?.Value;
                var userExists = await _context.Users.AnyAsync(user => user.Email == userEmail);
                var base64Picture = await _graphAPICalls.GetUserPicAsync();

                // Store session data in cookies
                Response.Cookies.Append("UserName", userName, new CookieOptions
                {
                    HttpOnly = false,  // Do not set HttpOnly if you need access from JavaScript
                    Secure = true,
                    SameSite = SameSiteMode.Strict,
                    Expires = DateTimeOffset.UtcNow.AddSeconds(20)
                });
                Response.Cookies.Append("UserEmail", userEmail, new CookieOptions
                {
                    HttpOnly = false,  // Same here
                    Secure = true,
                    SameSite = SameSiteMode.Strict,
                    Expires = DateTimeOffset.UtcNow.AddSeconds(20)
                });
                Response.Cookies.Append("IsAuthenticated", User.Identity.IsAuthenticated.ToString().ToLower(), new CookieOptions
                {
                    HttpOnly = false,  // Same here
                    Secure = true,
                    SameSite = SameSiteMode.Strict,
                    Expires = DateTimeOffset.UtcNow.AddSeconds(20)
                });
                Response.Cookies.Append("UserExists", userExists.ToString().ToLower(), new CookieOptions
                {
                    HttpOnly = false,  // Same here
                    Secure = true,
                    SameSite = SameSiteMode.Strict,
                    Expires = DateTimeOffset.UtcNow.AddSeconds(20)
                });



                    var script = $@"
<script>
    if (window.opener) {{
        window.opener.postMessage({{
            IsAuthenticated:  {User.Identity.IsAuthenticated.ToString().ToLower()},
            UserName: '{userName}',
            UserEmail: '{userEmail}', 
            UserExists: '{userExists.ToString().ToLower()}',
            UserPicture: '{base64Picture}'
        }}, '*');

        // Adding a delay before closing the window to ensure message is sent properly
        setTimeout(function() {{
            window.close();
        }}, 500);
    }}
</script>";
                    return Content(script, "text/html");

                }

            return Content("<script>window.close();</script>", "text/html");
        }
       
        [HttpGet("UserDTO")]
        public async Task<IActionResult> UserDTO()
        {
            bool isAuthenticated = User.Identity.IsAuthenticated;
            string userName = User.Identity.Name;
            string userEmail = User.Claims.FirstOrDefault(c => c.Type == ClaimTypes.Email)?.Value;

            var userDto = new
            {
                IsAuthenticated = isAuthenticated,
                UserName = userName,
                UserEmail = userEmail
            };

            return Ok(userDto);
        }
       
    }
}
