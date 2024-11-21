using Microsoft.AspNetCore.Authentication.MicrosoftAccount;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Identity.Client;
using Microsoft.Graph;
using Azure.Identity;

namespace CaliberLunchPortalAPI.Controllers
{
    [ApiController]
    [Route("[controller]")]
    public class UserController : Controller
    {
        [HttpGet("GetProfileDetails")]
        public async void GetProfileDetails()
        {
            var clientId = "4a535daa-1f4f-4e60-9473-2177971f360b";
            var tenantId = "5a69283a-cd30-43ac-aca1-d624657bee23";
            var clientSecret = "ig38Q~DkGxSEXeax.QecJqB-Oeta9n~y4rXStaa7";

            // Authenticate and create Graph client
            var options = new TokenCredentialOptions { AuthorityHost = AzureAuthorityHosts.AzurePublicCloud };
            var clientSecretCredential = new ClientSecretCredential(tenantId, clientId, clientSecret, options);
            var graphClient = new GraphServiceClient(clientSecretCredential, new[] { "https://graph.microsoft.com/.default" });

            try
            {
                // Get profile picture for the signed-in user
                var photoStream = await graphClient.Users["ashutosh.bs@caliberuniversal.com"].Photo.Content.GetAsync();

                if (photoStream == null)
                {

                }

                // Convert photo stream to Base64 string
                using (var memoryStream = new MemoryStream())
                {
                    await photoStream.CopyToAsync(memoryStream);
                    var base64Photo = Convert.ToBase64String(memoryStream.ToArray());
                }
            }
            catch (ServiceException ex)
            {
                Console.WriteLine($"Error retrieving profile picture: {ex.Message}");
            }
        }

    }
}
