using Microsoft.AspNetCore.Mvc;

namespace CaliberLunchPortalAPI.Controllers
{
    [ApiController]
    [Route("[controller]")]
    public class SessionController : Controller
    {
        [HttpPost("set")]
        public IActionResult SetSessionData([FromBody] string value)
        {
            if (string.IsNullOrEmpty(value))
            {
                return BadRequest("Value cannot be null or empty");
            }

            HttpContext.Session.SetString("MySessionKey", value);
            Console.WriteLine($"Session value set: {value}");
            return Ok("Session value set");
        }

        [HttpGet("get")]
        public IActionResult GetSessionData()
        {
            var value = HttpContext.Session.GetString("MySessionKey");
            if (value != null)
            {
                return Ok(new { sessionData = value });
            }
            return NotFound("No session data found");
        }
    }
}
