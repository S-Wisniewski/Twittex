using Microsoft.EntityFrameworkCore;
using ModerationSystem.Api.Models.Entities;

namespace ModerationSystem.Api.Data
{
    public static class DbSeeder
    {
        public static async Task SeedAsync(AppDbContext context)
        {
            await context.Database.EnsureCreatedAsync();

            if (!await context.Users.AnyAsync(u => u.CognitoUserId == "mocked-current-user-id"))
            {
                var mockUser = new User
                {
                    CognitoUserId = "mocked-current-user-id",
                    UserName = "TestUser",
                    DisplayName = "Test User",
                    Bio = "I am a seeded test user.",
                    CreatedAt = DateTime.UtcNow,
                    AvatarUrl = "https://api.dicebear.com/7.x/avataaars/svg?seed=TestUser"
                };

                context.Users.Add(mockUser);
                await context.SaveChangesAsync();
            }
        }
    }
}
