using Microsoft.AspNetCore.Authentication.MicrosoftAccount;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace CaliberLunchPortalAPI.Controllers
{
    [ApiController]
    [Route("[controller]")]
    public class Identity : Controller
    {
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

                // Store session data in cookies
                Response.Cookies.Append("UserName", userName, new CookieOptions
                {
                    HttpOnly = false,  // Do not set HttpOnly if you need access from JavaScript
                    Secure = true,
                    SameSite = SameSiteMode.Strict,
                    Expires = DateTimeOffset.UtcNow.AddDays(1)
                });
                Response.Cookies.Append("UserEmail", userEmail, new CookieOptions
                {
                    HttpOnly = false,  // Same here
                    Secure = true,
                    SameSite = SameSiteMode.Strict,
                    Expires = DateTimeOffset.UtcNow.AddDays(1)
                });

                var script = $@"
            <script>
                if (window.opener) {{
                    window.opener.postMessage({{
                        IsAuthenticated: true,
                        UserName: '{userName}',
                        UserEmail: '{userEmail}'
                    }}, '*');
                }}
                window.close();
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
