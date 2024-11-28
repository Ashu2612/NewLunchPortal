using Azure.Identity;
using CaliberLunchPortalAPI.DBContext;
using Microsoft.Graph;

namespace CaliberLunchPortalAPI.Utilities
{
    public interface IGraphAPICalls
    {
        Task<string> GetUserPicAsync();
    }

    public class GraphAPICalls : IGraphAPICalls
    {
        private readonly IConfiguration _configuration;

        public GraphAPICalls(IConfiguration configuration)
        {
            _configuration = configuration;
        }

        public async Task<string> GetUserPicAsync()
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
