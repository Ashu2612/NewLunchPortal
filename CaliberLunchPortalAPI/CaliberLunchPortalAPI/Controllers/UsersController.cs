using Microsoft.AspNetCore.Authentication.MicrosoftAccount;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Identity.Client;
using Microsoft.Graph;
using Azure.Identity;
using CaliberLunchPortalAPI.Models;
using Microsoft.EntityFrameworkCore;
using CaliberLunchPortalAPI.DBContext;
using CaliberLunchPortalAPI.Utilities;
using Newtonsoft.Json.Linq;

namespace CaliberLunchPortalAPI.Controllers
{
    [ApiController]
    [Route("[controller]")]
    public class UsersController : Controller
    {
        private readonly ApplicationDbContext _context;
        private readonly IConfiguration _configuration;
        private readonly IGraphAPICalls _graphAPICalls;

        public UsersController(IConfiguration configuration, ApplicationDbContext context, IGraphAPICalls graphAPICalls)
        {
            _configuration = configuration;
            _context = context;
            _graphAPICalls = graphAPICalls;
        }

        [HttpPut("InsertEmployeeDetails")]
        public async Task<IActionResult> InsertEmployeeDetails([FromBody] dynamic data)
        {
            try
            {
                var jsonData = JObject.Parse(data.ToString());

                var user = new Users
                {
                    EmployeeId = (int)jsonData["EmployeeId"],
                    Name = (string)jsonData["Name"],
                    Email = (string)jsonData["Email"],
                    DiplayPic = Convert.FromBase64String((string)jsonData["DiplayPic"]),
                    IsAdmin = (bool)jsonData["IsAdmin"]
                };

                _context.Users.Add(user);
                await _context.SaveChangesAsync();

            }
            catch(Exception ex)
            {

            }
            return Ok();
        }

        [HttpGet("GetEmployeesDetails")]
        public async Task<IActionResult> GetEmployeesDetails()
        {
            try
            {
                var users = await _context.Users
                    .Select(user => new
                    {
                        user.Id,
                        user.EmployeeId,
                        user.Name,
                        user.Email,
                        DiplayPic = user.DiplayPic != null ? Convert.ToBase64String(user.DiplayPic) : null, // Convert image to Base64
                        user.IsAdmin
                    })
                    .ToListAsync();

                return Ok(users);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An error occurred.", details = ex.Message });
            }
        }



    }
}
