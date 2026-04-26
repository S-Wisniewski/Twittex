using System.Net;
using System.Text.Json;

namespace ModerationSystem.Api.Extensions
{
    public static class ExceptionHandlingExtensions
    {
        public static WebApplication UseGlobalExceptionHandling(this WebApplication app)
        {
            app.UseExceptionHandler(appBuilder =>
            {
                appBuilder.Run(async context =>
                {
                    context.Response.ContentType = "application/json";
                    context.Response.StatusCode = (int)HttpStatusCode.InternalServerError;

                    var exception = context.Features
                        .Get<Microsoft.AspNetCore.Diagnostics.IExceptionHandlerFeature>()
                        ?.Error;

                    var response = new
                    {
                        error = "An unexpected error occurred",
                        detail = app.Environment.IsDevelopment()
                            ? exception?.Message
                            : null
                    };

                    await context.Response.WriteAsync(
                        JsonSerializer.Serialize(response)
                    );
                });
            });

            return app;
        }
    }
}