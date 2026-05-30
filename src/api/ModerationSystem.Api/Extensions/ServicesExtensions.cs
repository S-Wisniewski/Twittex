using Microsoft.EntityFrameworkCore;
using ModerationSystem.Api.Data;
using ModerationSystem.Api.Services.Posts;
using ModerationSystem.Api.Services.Audit;
using ModerationSystem.Api.Mappings;
using ModerationSystem.Api.Services.Notifications;
using ModerationSystem.Api.Services.Users;
using ModerationSystem.Api.Services.Auth;
using ModerationSystem.Api.Services.Ai;
using Amazon.CognitoIdentityProvider;

namespace ModerationSystem.Api.Extensions
{
    public static class ServiceExtensions
    {
        public static IServiceCollection AddAppServices(this IServiceCollection services, IConfiguration config)
        {
            services.AddControllers();

            services.AddDbContext<AppDbContext>(options =>
                options.UseNpgsql(config.GetConnectionString("DefaultConnection")));

            services.AddScoped<IPostService, PostService>();
            services.AddScoped<IAuditService, AuditService>();
            services.AddScoped<NotificationService>();
            services.AddScoped<IUserService, UserService>();
            services.AddScoped<IAuthService, AuthService>();
            services.AddScoped<IAiService, AiService>();
            services.AddAWSService<IAmazonCognitoIdentityProvider>();

            services.AddSignalR();

            services.AddOpenApi();

            services.AddAutoMapper(
                cfg => { },
                typeof(MappingProfile).Assembly
            );

            return services;
        }
    }
}