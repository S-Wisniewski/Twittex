using Microsoft.EntityFrameworkCore;
using ModerationSystem.Api.Data;
using ModerationSystem.Api.Services.Posts;
using ModerationSystem.Api.Services.Audit;
using ModerationSystem.Api.Mappings;
using ModerationSystem.Api.Services.Notifications;

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