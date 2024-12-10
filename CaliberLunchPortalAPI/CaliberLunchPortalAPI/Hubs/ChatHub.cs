using Microsoft.AspNetCore.SignalR;

namespace CaliberLunchPortalAPI.Hubs
{
    public class ChatHub : Hub
    {
        public async Task SendMessage(int senderId, int receiverId, string message)
        {
            await Clients.User(receiverId.ToString()).SendAsync("ReceiveMessage", senderId, message);
        }

        public override async Task OnConnectedAsync()
        {
            var email = Context.GetHttpContext()?.Request.Query["email"];
            if (!string.IsNullOrEmpty(email))
            {
                // Map the email to the connection ID
                await Groups.AddToGroupAsync(Context.ConnectionId, email);
            }
            await base.OnConnectedAsync();
        }

    }
}
