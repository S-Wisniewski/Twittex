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

            app.UseHttpsRedirection();

            // Diagnostic Middleware
            app.Use(async (context, next) =>
            {
                var authHeader = context.Request.Headers["Authorization"].ToString();

                Console.WriteLine(
                    $"\n>>> [Incoming Request] {context.Request.Method} {context.Request.Path}");

                if (string.IsNullOrEmpty(authHeader))
                {
                    Console.WriteLine(">>> [Auth] No Authorization header found.");
                }
                else
                {
                    var preview = authHeader.Length > 25
                        ? authHeader[..25]
                        : authHeader;

                    Console.WriteLine($">>> [Auth] Header found: {preview}...");
                }

                await next();

                Console.WriteLine(
                    $">>> [Response] Status: {context.Response.StatusCode}\n");
            });

            app.UseCors();
            app.UseGlobalExceptionHandling();

            app.UseAuthentication();
            app.UseAuthorization();

            app.MapControllers();
            app.MapHub<NotificationHub>("/hubs/notifications");

            return app;
        }
    }
}