namespace CaliberLunchPortalAPI.Models
{
    public class Users
    {
        public int Id { get; set; }
        public int EmployeeId { get; set; }
        public string Name { get; set; }
        public string Email { get; set; }
        public byte[] DiplayPic { get; set; }
        public bool IsAdmin { get; set; }
    }
}
