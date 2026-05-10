using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using ModerationSystem.Api.Data;
using ModerationSystem.Api.Mappings;
using ModerationSystem.Api.Services.Audit;
using ModerationSystem.Api.Services.Auth;
using ModerationSystem.Api.Services.Posts;
using ModerationSystem.Api.Services.Users;
using ModerationSystem.Api.Services.Ai;
using Microsoft.EntityFrameworkCore;
using Scalar.AspNetCore;
using DotNetEnv;

var rootPath = Path.GetFullPath(Path.Combine(Directory.GetCurrentDirectory(), "../../../"));
var envPath = Path.Combine(rootPath, ".env");

if (File.Exists(envPath))
{
    Env.Load(envPath);
}

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddCors(options =>
{
    options.AddDefaultPolicy(policy =>
    {
        policy.AllowAnyOrigin()
              .AllowAnyMethod()
              .AllowAnyHeader();
    });
});

builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.Authority = builder.Configuration["Cognito:Authority"];
        options.MapInboundClaims = false; // Prevents mapping 'sub' to long XML schema name
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidIssuer = builder.Configuration["Cognito:Authority"],
            ValidateAudience = false,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            ClockSkew = TimeSpan.FromMinutes(2)
        };

        options.Events = new JwtBearerEvents
        {
            OnAuthenticationFailed = context =>
            {
                Console.WriteLine($"\n[Auth Failed] {context.Exception.Message}\n");
                return Task.CompletedTask;
            },
            OnTokenValidated = context =>
            {
                // Cognito puts the user ID in the 'sub' claim
                // By default ASP.NET maps this to NameIdentifier
                Console.WriteLine("\n[Auth Success] Token validated.\n");
                return Task.CompletedTask;
            }
        };
    });

// Add services to the container.
builder.Services.AddScoped<IAuditService, AuditService>();
builder.Services.AddScoped<IPostService, PostService>();
builder.Services.AddScoped<IUserService, UserService>();
builder.Services.AddScoped<IAuthService, AuthService>();
builder.Services.AddScoped<IAiService, AiService>();

builder.Services.AddAutoMapper(
    cfg => { },
    typeof(MappingProfile).Assembly
);

builder.Services.AddControllers();
// Learn more about configuring OpenAPI at https://aka.ms/aspnet/openapi
builder.Services.AddOpenApi();

builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseNpgsql(
        builder.Configuration.GetConnectionString("DefaultConnection")
    )
);

var app = builder.Build();

// Diagnostic Middleware: Log every request and its Auth status
app.Use(async (context, next) =>
{
    var authHeader = context.Request.Headers["Authorization"].ToString();
    Console.WriteLine($"\n>>> [Incoming Request] {context.Request.Method} {context.Request.Path}");
    
    if (string.IsNullOrEmpty(authHeader))
    {
        Console.WriteLine(">>> [Auth] No Authorization header found.");
    }
    else
    {
        var preview = authHeader.Length > 25 ? authHeader.Substring(0, 25) : authHeader;
        Console.WriteLine($">>> [Auth] Header found: {preview}...");
    }

    await next();

    Console.WriteLine($">>> [Response] Status: {context.Response.StatusCode}\n");
});

// Seed the database
using (var scope = app.Services.CreateScope())
{
    var services = scope.ServiceProvider;
    var context = services.GetRequiredService<AppDbContext>();
    await DbSeeder.SeedAsync(context);
}

// Configure the HTTP request pipeline.
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
    //app.UseExceptionHandler("/error");
    app.UseHsts();
}

app.UseHttpsRedirection();

app.UseCors();

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();
//app.MapHealthChecks("/health");

app.Run();
