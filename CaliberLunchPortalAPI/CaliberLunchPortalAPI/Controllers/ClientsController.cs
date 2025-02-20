using CaliberLunchPortalAPI.DBContext;
using CaliberLunchPortalAPI.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace CaliberLunchPortalAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ClientsController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public ClientsController(ApplicationDbContext context)
        {
            _context = context;
        }

        [HttpPost("register")]
        public async Task<IActionResult> RegisterClient(Client clientInfo)
        {
            var existingClient = await _context.Clients
                .Include(c => c.Heartbeats)
                .FirstOrDefaultAsync(c => c.MacAddress == clientInfo.MacAddress);
            Heartbeat heartbeat = new();

            if (existingClient != null)
            {
                // Update existing client details
                existingClient.Hostname = clientInfo.Hostname;
                existingClient.SerialNumber = clientInfo.SerialNumber;
                existingClient.IPAddress = clientInfo.IPAddress;
                existingClient.Version = clientInfo.Version;
                existingClient.EnvironmentType = clientInfo.EnvironmentType;
                existingClient.UpdatedAt = DateTime.UtcNow;
                existingClient.LastCommunication = DateTime.UtcNow;
                heartbeat.ClientId = existingClient.Id;

            }
            else
            {
                clientInfo.CreatedAt = DateTime.UtcNow;
                clientInfo.UpdatedAt = DateTime.UtcNow;
                clientInfo.LastCommunication = DateTime.UtcNow;
                heartbeat.ClientId = clientInfo.Id;

                await _context.Clients.AddAsync(clientInfo);
            }
            heartbeat.Status = "Active";
            heartbeat.ReportedAt = DateTime.UtcNow;
            heartbeat.Client = null;
            await _context.Heartbeats.AddAsync(heartbeat);

            await _context.SaveChangesAsync();
            return Ok(new { message = "Client registered/updated successfully." });
        }


        [HttpPost("heartbeat")]
        public async Task<IActionResult> SendHeartbeat([FromBody] Heartbeat heartbeat)
        {
            // Check if the client with the provided MacAddress already exists
            var client = await _context.Clients.FirstOrDefaultAsync(c => c.MacAddress == heartbeat.Client.MacAddress);

            if (client == null)
            {
                // If the client doesn't exist, create a new client
                client = new Client
                {
                    MacAddress = heartbeat.Client.MacAddress,
                    Version = heartbeat.Client.Version,
                    LastCommunication = DateTime.UtcNow
                };

                // Add new client to the database
                await _context.Clients.AddAsync(client);
                await _context.SaveChangesAsync();
            }

            // Now we have a valid client to associate the heartbeat with
            client.LastCommunication = DateTime.UtcNow;
            client.Version = heartbeat.Client.Version;
            client.UpdatedAt = DateTime.UtcNow;

            heartbeat.ClientId = client.Id;
            heartbeat.ReportedAt = DateTime.UtcNow;
            heartbeat.Client = null;
            // Add heartbeat to the database
            await _context.Heartbeats.AddAsync(heartbeat);

            await _context.SaveChangesAsync();
            return Ok(new { message = "Heartbeat received." });
        }

        [HttpGet("activeClients")]
        public async Task<IActionResult> GetActiveClients()
        {
            var latestHeartbeats = await _context.Heartbeats
             .GroupBy(hb => hb.ClientId)
             .Select(g => g.OrderByDescending(hb => hb.ReportedAt).FirstOrDefault())
             .ToListAsync();

            var activeClients = latestHeartbeats
                .Where(hb => hb.Status == "Active")
                .Select(hb => hb.ClientId)
                .ToList();

            var clients = await _context.Clients
                .Where(c => activeClients.Contains(c.Id))
                .ToListAsync();

            var result = latestHeartbeats
                .Where(hb => hb.Status == "Active")
                .Select(hb => new
                {
                    ClientId = hb.ClientId,
                    Heartbeat = new
                    {
                        hb.Id,
                        hb.Status,
                        hb.ReportedAt
                    },
                    ClientDetails = clients.Where(c => c.Id == hb.ClientId).Select(c => new
                    {
                        c.Id,
                        c.MacAddress,
                        c.Hostname,
                        c.SerialNumber,
                        c.IPAddress,
                        c.LastCommunication,
                        c.Version,
                        c.EnvironmentType,
                        c.CreatedAt,
                        c.UpdatedAt
                    }).FirstOrDefault()
                }).ToList();

            return Ok(result);
        }


        [HttpGet("inactiveClients")]
        public async Task<IActionResult> GetAbandonedClients()
        {
            var latestHeartbeats = await _context.Heartbeats
           .GroupBy(hb => hb.ClientId)
           .Select(g => g.OrderByDescending(hb => hb.ReportedAt).FirstOrDefault())
           .ToListAsync();

            var inactiveClients = latestHeartbeats
                .Where(hb => hb.Status == "Inactive")
                .Select(hb => hb.ClientId)
                .ToList();

            var clients = await _context.Clients
                .Where(c => inactiveClients.Contains(c.Id))
                .ToListAsync();

            var result = latestHeartbeats
                .Where(hb => hb.Status == "Inactive")
                .Select(hb => new
                {
                    ClientId = hb.ClientId,
                    Heartbeat = new
                    {
                        hb.Id,
                        hb.Status,
                        hb.ReportedAt
                    },
                    ClientDetails = clients.Where(c => c.Id == hb.ClientId).Select(c => new
                    {
                        c.Id,
                        c.MacAddress,
                        c.Hostname,
                        c.SerialNumber,
                        c.IPAddress,
                        c.LastCommunication,
                        c.Version,
                        c.EnvironmentType,
                        c.CreatedAt,
                        c.UpdatedAt
                    }).FirstOrDefault()
                }).ToList();

            return Ok(result);
        }


        [HttpGet("activeDevices")]
        public async Task<IActionResult> GetActiveDevices()
        {
            var config = await _context.Configurations.FirstOrDefaultAsync();
            var inactivityThreshold = config?.InactivityThreshold ?? 7;

            var thresholdDate = DateTime.UtcNow.AddDays(-inactivityThreshold);

            var activeClients = await _context.Clients
                .Where(c => c.LastCommunication >= thresholdDate)
                .ToListAsync();

            return Ok(activeClients);
        }

        [HttpGet("abandonedDevices")]
        public async Task<IActionResult> GetAbandonedDevices()
        {
            var config = await _context.Configurations.FirstOrDefaultAsync();
            var inactivityThreshold = config?.InactivityThreshold ?? 7;

            var thresholdDate = DateTime.UtcNow.AddDays(-inactivityThreshold);

            var activeClients = await _context.Clients
                .Where(c => c.LastCommunication <= thresholdDate)
                .ToListAsync();

            return Ok(activeClients);
        }
        [HttpGet("clientAndDeviceStatus")]
        public async Task<IActionResult> GetClientAndDeviceStatus()
        {
            // Fetch the latest heartbeats grouped by ClientId
            var latestHeartbeats = await _context.Heartbeats
                .GroupBy(hb => hb.ClientId)
                .Select(g => g.OrderByDescending(hb => hb.ReportedAt).FirstOrDefault())
                .ToListAsync();

            // Fetch the config to get the inactivity threshold
            var config = await _context.Configurations.FirstOrDefaultAsync();
            var inactivityThreshold = config?.InactivityThreshold ?? 7;
            var thresholdDate = DateTime.UtcNow.AddDays(-inactivityThreshold);

            // Separate active and inactive clients based on heartbeat status
            var activeClients = latestHeartbeats
                .Where(hb => hb.Status == "Active")
                .Select(hb => hb.ClientId)
                .ToList();

            var inactiveClients = latestHeartbeats
                .Where(hb => hb.Status == "Inactive")
                .Select(hb => hb.ClientId)
                .ToList();

            // Get the client details for both active and inactive clients
            var clients = await _context.Clients
                .Where(c => activeClients.Contains(c.Id) || inactiveClients.Contains(c.Id))
                .ToListAsync();

            // Get abandoned devices based on the inactivity threshold
            var abandonedDevices = await _context.Clients
                .Where(c => c.LastCommunication <= thresholdDate)
                .ToListAsync();

            var abandonedClientIds = abandonedDevices.Select(c => c.Id).ToList();

            // Get active clients based on heartbeat status
            var activeClientDetails = latestHeartbeats
                .Where(hb => hb.Status == "Active" && !abandonedClientIds.Contains(hb.ClientId)) // Ensure abandoned clients are not included
                .Select(hb => new
                {
                    ClientId = hb.ClientId,
                    Heartbeat = new
                    {
                        hb.Id,
                        hb.Status,
                        hb.ReportedAt
                    },
                    ClientDetails = clients.Where(c => c.Id == hb.ClientId).Select(c => new
                    {
                        c.Id,
                        c.MacAddress,
                        c.Hostname,
                        c.SerialNumber,
                        c.IPAddress,
                        c.LastCommunication,
                        c.Version,
                        c.EnvironmentType,
                        c.CreatedAt,
                        c.UpdatedAt
                    }).FirstOrDefault()
                }).ToList();

            // Get inactive clients based on heartbeat status or if they are abandoned
            var inactiveClientDetails = latestHeartbeats
                .Where(hb => hb.Status == "Inactive" || abandonedClientIds.Contains(hb.ClientId)) // Mark abandoned clients as inactive
                .Select(hb => new
                {
                    ClientId = hb.ClientId,
                    Heartbeat = new
                    {
                        hb.Id,
                        hb.Status,
                        hb.ReportedAt
                    },
                    ClientDetails = clients.Where(c => c.Id == hb.ClientId).Select(c => new
                    {
                        c.Id,
                        c.MacAddress,
                        c.Hostname,
                        c.SerialNumber,
                        c.IPAddress,
                        c.LastCommunication,
                        c.Version,
                        c.EnvironmentType,
                        c.CreatedAt,
                        c.UpdatedAt
                    }).FirstOrDefault()
                }).ToList();

            // Get active devices based on the inactivity threshold
            var activeDevices = await _context.Clients
                .Where(c => c.LastCommunication >= thresholdDate)
                .ToListAsync();

            var allRegisteredDevices = await _context.Clients.ToListAsync();

            // Prepare the final result
            var result = new
            {
                ActiveClients = activeClientDetails,
                InactiveClients = inactiveClientDetails,
                AllRegisteredDevices = allRegisteredDevices.Select(c => new
                {
                    c.Id,
                    c.MacAddress,
                    c.Hostname,
                    c.SerialNumber,
                    c.IPAddress,
                    c.LastCommunication,
                    c.Version,
                    c.EnvironmentType,
                    c.CreatedAt,
                    c.UpdatedAt
                }).ToList(),
                ActiveDevices = activeDevices.Select(c => new
                {
                    c.Id,
                    c.MacAddress,
                    c.Hostname,
                    c.SerialNumber,
                    c.IPAddress,
                    c.LastCommunication,
                    c.Version,
                    c.EnvironmentType,
                    c.CreatedAt,
                    c.UpdatedAt
                }).ToList(),
                AbandonedDevices = abandonedDevices.Select(c => new
                {
                    c.Id,
                    c.MacAddress,
                    c.Hostname,
                    c.SerialNumber,
                    c.IPAddress,
                    c.LastCommunication,
                    c.Version,
                    c.EnvironmentType,
                    c.CreatedAt,
                    c.UpdatedAt
                }).ToList()
            };

            return Ok(result);
        }

    }
}
