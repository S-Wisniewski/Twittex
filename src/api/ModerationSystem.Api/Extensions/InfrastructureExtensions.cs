namespace ModerationSystem.Api.Extensions
{
    public static class InfrastructureExtensions
    {
        public static IServiceCollection AddInfrastructure(
            this IServiceCollection services,
            IConfiguration configuration)
        {
            services.AddCors(options =>
            {
                options.AddDefaultPolicy(policy =>
                {
                    var origins = configuration
                        .GetSection("Cors:AllowedOrigins")
                        .Get<string[]>() ?? [];

                    policy
                        .WithOrigins(origins)
                        .AllowAnyHeader()
                        .AllowAnyMethod()
                        .AllowCredentials();
                });
            });

            return services;
        }
    }
}