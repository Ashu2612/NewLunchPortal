using Microsoft.AspNetCore.Authentication.MicrosoftAccount;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using Azure.Identity;
using Microsoft.Graph;

namespace CaliberLunchPortalAPI.Controllers
{
    [ApiController]
    [Route("[controller]")]
    public class Identity : Controller
    {
        private readonly IConfiguration _configuration;

        public Identity(IConfiguration configuration)
        {
            _configuration = configuration;
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

                if (User.Identity.IsAuthenticated)
                {
                    var base64Picture = await GetUserPicAsync();

                    var script = $@"
<script>
    if (window.opener) {{
        window.opener.postMessage({{
            IsAuthenticated: true,
            UserName: '{userName}',
            UserEmail: '{userEmail}',
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
                else
                {
                    var script = $@"
            <script>
                if (window.opener) {{
                    window.opener.postMessage({{
                        IsAuthenticated: false,
                        UserName: '{userName}',
                        UserEmail: '{userEmail}'
                    }}, '*');
                }}
                window.close();
            </script>";

                    return Content(script, "text/html");

                }


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
        private async Task<string> GetUserPicAsync()
        {
            // Read credentials from appsettings
            var clientId = _configuration["Authentication:Microsoft:ClientId"];
            var tenantId = _configuration["Authentication:Microsoft:TenantId"];
            var clientSecret = _configuration["Authentication:Microsoft:ClientSecret"];

            // Authenticate and create Graph client
            var options = new TokenCredentialOptions { AuthorityHost = AzureAuthorityHosts.AzurePublicCloud };
            var clientSecretCredential = new ClientSecretCredential(tenantId, clientId, clientSecret, options);
            var graphClient = new GraphServiceClient(clientSecretCredential, new[] { "https://graph.microsoft.com/.default" });

            try
            {
                // Get profile picture for the specified user
                var photoStream = await graphClient.Users["ashutosh.bs@caliberuniversal.com"].Photo.Content.GetAsync();

                if (photoStream == null)
                {
                    // Return a placeholder Base64 string for missing profile picture
                    return "";
                }

                // Convert photo stream to Base64 string
                using (var memoryStream = new MemoryStream())
                {
                    await photoStream.CopyToAsync(memoryStream);
                    return Convert.ToBase64String(memoryStream.ToArray());
                }
            }
            catch (ServiceException ex)
            {
                // Log error for debugging
                Console.WriteLine($"Error retrieving profile picture: {ex.Message}");
                return ""; // Return an empty string on error
            }
        }

    }
}
