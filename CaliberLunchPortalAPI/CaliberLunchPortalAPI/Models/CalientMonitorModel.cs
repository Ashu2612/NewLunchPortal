namespace CaliberLunchPortalAPI.Models
{
    public class Client
    {
        public Guid Id { get; set; } = Guid.NewGuid();
        public string? MacAddress { get; set; }
        public string? Hostname { get; set; }
        public string? SerialNumber { get; set; }
        public string? IPAddress { get; set; }
        public DateTime LastCommunication { get; set; }
        public string? Version { get; set; }
        public string? EnvironmentType { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

        public List<Heartbeat> Heartbeats { get; set; } = new List<Heartbeat>();
    }

    public class Heartbeat
    {
        public Guid Id { get; set; } = Guid.NewGuid();
        public Guid ClientId { get; set; }
        public Client? Client { get; set; }
        public string? Status { get; set; } // Active or Inactive
        public DateTime ReportedAt { get; set; } = DateTime.UtcNow;
    }

    public class Configuration
    {
        public int Id { get; set; }
        public int InactivityThreshold { get; set; } = 7; // Days
    }
}
