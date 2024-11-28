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
            modelBuilder.Entity<UsersModel>().HasNoKey();
        }
        public DbSet<UsersModel> UsersModel { get; set; }
    }
}
