using CaliberLunchPortalAPI.DBContext;
using CaliberLunchPortalAPI.Utilities;
using CaliberLunchPortalAPI.Hubs;
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
        builder.Services.AddSignalR().AddHubOptions<ChatHub>(options =>
        {
            options.EnableDetailedErrors = true;
            options.KeepAliveInterval = TimeSpan.FromSeconds(15); // Default is 15 seconds
            options.ClientTimeoutInterval = TimeSpan.FromSeconds(30); // Default is 30 seconds
        });
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
               policy.WithOrigins("http://10.20.57.92:52505") // Allow your Angular app's URL
              .AllowAnyHeader()
              .AllowAnyMethod()
              .AllowCredentials(); // This is crucial for SignalR
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
        app.MapHub<ChatHub>("/chatHub");
        app.Run();
    }
}