using CaliberLunchPortalAPI.DBContext;
using CaliberLunchPortalAPI.Utilities;
using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.Authentication.MicrosoftAccount;
using Microsoft.EntityFrameworkCore;

internal class Program
{
    private static void Main(string[] args)
    {
        var builder = WebApplication.CreateBuilder(args);

        // Add services to the container.
        builder.Services.AddControllers();
        builder.Services.AddEndpointsApiExplorer();
        builder.Services.AddSwaggerGen();

        builder.Services.AddAuthentication(options =>
        {
            options.DefaultScheme = CookieAuthenticationDefaults.AuthenticationScheme;
            options.DefaultChallengeScheme = MicrosoftAccountDefaults.AuthenticationScheme;
        })
        .AddCookie()
        .AddMicrosoftAccount(options =>
        {
            options.ClientId = builder.Configuration["Authentication:Microsoft:ClientId"]; // Use configuration or environment variables
            options.ClientSecret = builder.Configuration["Authentication:Microsoft:ClientSecret"];
            options.CorrelationCookie.SameSite = SameSiteMode.None;
        });
        builder.Services.AddDistributedMemoryCache();

        builder.Services.AddSession(options =>
            {
                options.IdleTimeout = TimeSpan.FromHours(1); // Session will expire after 1 hour of inactivity
                options.Cookie.HttpOnly = false; // Important for security
                options.Cookie.IsEssential = true; // Make the session cookie essential (required for GDPR compliance)
            });
        builder.Services.ConfigureApplicationCookie(options =>
        {
            options.Cookie.SameSite = SameSiteMode.None; // Adjust as needed
            options.Cookie.SecurePolicy = CookieSecurePolicy.Always; // For HTTPS only
        });

        builder.Services.AddDbContext<ApplicationDbContext>(options =>
            options.UseNpgsql(builder.Configuration.GetConnectionString("DefaultConnection")));

        builder.Services.AddCors(options =>
        {
            options.AddPolicy("AllowAngularApp", policy =>
            {
                policy.AllowAnyOrigin() // Allow all origins
              .AllowAnyHeader() // Allow all headers
              .AllowAnyMethod(); // Allow all HTTP methods (GET, POST, etc.)
            });
        });

        builder.Services.AddScoped<IGraphAPICalls, GraphAPICalls>();


        var app = builder.Build();

        // Configure the HTTP request pipeline.
        if (app.Environment.IsDevelopment())
        {
            app.UseSwagger();
            app.UseSwaggerUI();
        }

        app.UseSession();
        app.UseCors("AllowAngularApp");
        app.UseHttpsRedirection();
        app.UseAuthentication();
        app.UseAuthorization();

        app.MapControllers();

        app.Run();
    }
}