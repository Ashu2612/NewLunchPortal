using CaliberLunchPortalAPI.Models;
using Microsoft.EntityFrameworkCore;

namespace CaliberLunchPortalAPI.DBContext
{
    public class ApplicationDbContext : DbContext
    {
        // Constructor to pass the options to the base class
        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
            : base(options)
        {
        }
        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            // Specify that UsersModel does not have a primary key
            modelBuilder.Entity<Users>().HasKey(e => e.Id);
            modelBuilder.Entity<Client>()
           .HasIndex(c => c.MacAddress)
           .IsUnique();
        }
        public DbSet<Users> Users { get; set; }
        public DbSet<Client> Clients { get; set; }
        public DbSet<Heartbeat> Heartbeats { get; set; }
        public DbSet<Configuration> Configurations { get; set; }
        public DbSet<ChatMessage> ChatMessages { get; set; }
    }
}
