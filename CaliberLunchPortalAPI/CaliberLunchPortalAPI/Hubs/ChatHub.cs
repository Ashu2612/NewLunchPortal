using Microsoft.AspNetCore.SignalR;

namespace CaliberLunchPortalAPI.Hubs
{
    public class ChatHub : Hub
    {
        public async Task SendMessage(string user, string message)
        {
            await Clients.All.SendAsync("ReceiveMessage", user, message);
        }
        public override async Task OnConnectedAsync()
        {
            // Log connection information
            string connectionId = Context.ConnectionId;
            string user = Context.User?.Identity?.Name ?? "Anonymous";
            System.Console.WriteLine($"Client connected: ConnectionId={connectionId}, User={user}");

            // Optionally add the connection to a group
            await Groups.AddToGroupAsync(connectionId, "DefaultGroup");

            // Notify other clients about the new connection
            await Clients.Others.SendAsync("UserConnected", user);

            // Continue with the default behavior
            await base.OnConnectedAsync();
        }

        public override async Task OnDisconnectedAsync(Exception exception)
        {
            // Handle disconnection logic if needed
            string connectionId = Context.ConnectionId;
            System.Console.WriteLine($"Client disconnected: ConnectionId={connectionId}");

            // Optionally remove the connection from groups
            await Groups.RemoveFromGroupAsync(connectionId, "DefaultGroup");

            // Notify other clients about the disconnection
            await Clients.Others.SendAsync("UserDisconnected", Context.User?.Identity?.Name ?? "Anonymous");

            await base.OnDisconnectedAsync(exception);
        }

        //public override async Task OnConnectedAsync()
        //{
        //    var employeeId = Context.GetHttpContext()?.Request.Query["employeeId"];
        //    if (!string.IsNullOrEmpty(employeeId))
        //    {
        //        // Map the email to the connection ID
        //        await Groups.AddToGroupAsync(Context.ConnectionId, employeeId);
        //    }
        //    await base.OnConnectedAsync();
        //}
        //public override async Task OnDisconnectedAsync(Exception? exception)
        //{
        //    var employeeId = Context.GetHttpContext()?.Request.Query["employeeId"];
        //    if (!string.IsNullOrEmpty(employeeId))
        //    {
        //        // Remove the connection from the group on disconnect
        //        await Groups.RemoveFromGroupAsync(Context.ConnectionId, employeeId);
        //    }
        //    await base.OnDisconnectedAsync(exception);
        //}

    }
}
