using CaliberLunchPortalAPI.DBContext;
using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;

namespace CaliberLunchPortalAPI.Hubs
{
    public class ChatHub : Hub
    {
        private readonly ApplicationDbContext _context;
        private readonly IHttpContextAccessor _httpContextAccessor;

        private static readonly Dictionary<string, string> UserConnections = new Dictionary<string, string>();

        public ChatHub(ApplicationDbContext context, IHttpContextAccessor httpContextAccessor)
        {
            _context = context;
            _httpContextAccessor = httpContextAccessor;
        }

        // Send a message to all connected admins
        public async Task SendMessageToAdmins(string fromUser, string message)
        {
            var admins = await _context.Users
                .Where(u => u.IsAdmin)
                .Select(u => u.Email)
                .ToListAsync();

            var user = await _context.Users
    .Where(u => u.Email == fromUser)
    .Select(u => u.Name)
    .ToListAsync();

            foreach (var adminEmail in admins)
            {
                if (UserConnections.TryGetValue(adminEmail, out string adminConnectionId))
                {
                    await Clients.Client(adminConnectionId).SendAsync("ReceiveMessage", user, message);
                }
            }

            // Send the message back to the sender for confirmation (once)
            if (UserConnections.TryGetValue(fromUser, out string senderConnectionId))
            {
                await Clients.Client(senderConnectionId).SendAsync("ReceiveMessage", "You", message);
            }
        }

        // Send a message to a specific user (from an admin)
        public async Task SendMessageToUser(string toUser, string fromAdmin, string message)
        {
            var admin = await _context.Users
.Where(u => u.Email == fromAdmin)
.Select(u => u.Name)
.ToListAsync();

            if (UserConnections.TryGetValue(toUser, out string userConnectionId))
            {
                await Clients.Client(userConnectionId).SendAsync("ReceiveMessage", admin, message);
            }

            // Optional confirmation to admin
            if (UserConnections.TryGetValue(fromAdmin, out string adminConnectionId))
            {
                await Clients.Client(adminConnectionId).SendAsync("ReceiveMessage", "You", message);
            }
        }

        public override async Task OnConnectedAsync()
        {
            string connectionId = Context.ConnectionId;
            string userEmail = Context.GetHttpContext()?.Request.Query["emailId"];

            if (!string.IsNullOrEmpty(userEmail))
            {
                UserConnections[userEmail] = connectionId;
            }

            Console.WriteLine($"Client connected: {userEmail} with ConnectionId: {connectionId}");

            await base.OnConnectedAsync();
        }

        public override async Task OnDisconnectedAsync(Exception exception)
        {
            string connectionId = Context.ConnectionId;

            var userEmail = UserConnections.FirstOrDefault(x => x.Value == connectionId).Key;
            if (userEmail != null)
            {
                UserConnections.Remove(userEmail);
                Console.WriteLine($"Client disconnected: {userEmail} with ConnectionId: {connectionId}");
            }

            await base.OnDisconnectedAsync(exception);
        }
    }

}
