using Microsoft.AspNetCore.SignalR;

public class ChatHub : Hub
{
    public async Task SendMessage(int senderId, int receiverId, string message)
    {
        await Clients.User(receiverId.ToString()).SendAsync("ReceiveMessage", senderId, message);
    }

    public override Task OnConnectedAsync()
    {
        // Map connection ID to user ID for private messaging
        var userId = Context.UserIdentifier; // Ensure authentication is set up
        return base.OnConnectedAsync();
    }
}
