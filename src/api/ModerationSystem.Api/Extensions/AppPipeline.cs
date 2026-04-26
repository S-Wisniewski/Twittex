using ModerationSystem.Api.Hubs;
using Scalar.AspNetCore;

namespace ModerationSystem.Api.Extensions
{
    public static class AppPipeline
    {
        public static WebApplication UseAppPipeline(this WebApplication app)
        {
            if (app.Environment.IsDevelopment())
            {
                app.MapOpenApi();

                app.MapScalarApiReference(options =>
                {
                    options
                        .WithTitle("API")
                        .WithTheme(ScalarTheme.Moon)
                        .WithDefaultHttpClient(ScalarTarget.CSharp, ScalarClient.HttpClient);
                });
            }
            else
            {
                app.UseHsts();
            }

            app.UseGlobalExceptionHandling();

            app.UseCors();

            app.UseAuthentication();
            app.UseAuthorization();

            app.MapControllers();
            app.MapHub<NotificationHub>("/hubs/notifications");

            return app;
        }
    }
}