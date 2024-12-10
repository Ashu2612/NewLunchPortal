using CaliberLunchPortalAPI.DBContext;
using CaliberLunchPortalAPI.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;

namespace CaliberLunchPortalAPI.Controllers
{
    [ApiController]
    [Route("api/chat")]
    public class ChatController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly IHubContext<ChatHub> _hubContext;

        public ChatController(ApplicationDbContext context, IHubContext<ChatHub> hubContext)
        {
            _context = context;
            _hubContext = hubContext;
        }

        [HttpPost("send")]
        public async Task<IActionResult> SendMessage([FromBody] ChatMessageDto messageDto)
        {
            var message = new ChatMessage
            {
                SenderId = messageDto.SenderId,
                ReceiverId = messageDto.ReceiverId,
                Message = messageDto.Message
            };

            _context.ChatMessages.Add(message);
            await _context.SaveChangesAsync();

            // Notify receiver
            await _hubContext.Clients.User(messageDto.ReceiverId.ToString())
                .SendAsync("ReceiveMessage", messageDto.SenderId, messageDto.Message);

            return Ok(message);
        }

        [HttpGet("history/{userId}/{adminId}")]
        public async Task<IActionResult> GetChatHistory(int userId, int adminId)
        {
            var messages = await _context.ChatMessages
                .Where(m => (m.SenderId == userId && m.ReceiverId == adminId) ||
                            (m.SenderId == adminId && m.ReceiverId == userId))
                .OrderBy(m => m.Timestamp)
                .ToListAsync();

            return Ok(messages);
        }
    }
}
