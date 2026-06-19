using DotNetEnv;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using ModerationSystem.Api.Data;
using ModerationSystem.Api.Models.Dto.ReportDtos;
using ModerationSystem.Api.Models.Entities;
using ModerationSystem.Api.Models.Enums;
using ModerationSystem.Api.Services.Ai;
using ModerationSystem.Api.Services.Audit;
using ModerationSystem.Api.Services.Notifications;
using ModerationSystem.Api.Services.Reports;
using Moq;

namespace ModerationSystem.Tests
{
    public class ReportSystemIntegrationTests
    {
        private readonly ReportService _reportService;
        private readonly AppDbContext _context;

        public ReportSystemIntegrationTests()
        {
            // Load environment variables for AWS
            var rootPath = Path.GetFullPath(Path.Combine(Directory.GetCurrentDirectory(), "../../../../../../"));
            var envPath = Path.Combine(rootPath, ".env");
            if (File.Exists(envPath))
            {
                Env.Load(envPath);
            }

            var configBuilder = new ConfigurationBuilder()
                .AddEnvironmentVariables()
                .Build();

            // Real AI Service hitting AWS Bedrock
            var aiService = new AiService(configBuilder);

            // Mock other services
            var auditMock = new Mock<IAuditService>();
            var notificationMock = new Mock<INotificationService>();

            // In-Memory Database
            var options = new DbContextOptionsBuilder<AppDbContext>()
                .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
                .Options;

            _context = new AppDbContext(options);

            _reportService = new ReportService(_context, aiService, auditMock.Object, notificationMock.Object);
        }

        [Fact]
        public async Task System_ShouldFlagPost_WhenObviousViolationIsReported()
        {
            // Arrange
            var authorId = "author1";
            _context.Users.Add(new User { CognitoUserId = authorId, UserName = "Spammer", ReputationScore = 50.0 });
            
            var post = new Post
            {
                Id = 1,
                CognitoUserId = authorId,
                Content = "This is definitely a spam post! Click my scammy link right now to win 1000$! http://scam-link.ru",
                Status = PostStatus.Published
            };
            _context.Posts.Add(post);

            for (int i = 1; i <= 5; i++)
            {
                _context.Users.Add(new User { CognitoUserId = $"reporter{i}", UserName = $"Reporter{i}", ReputationScore = 50.0 });
            }
            await _context.SaveChangesAsync();

            // Act
            for (int i = 1; i <= 5; i++)
            {
                await _reportService.CreateReportAsync(1, $"reporter{i}", new CreateReportRequest
                {
                    Reason = ReportReason.Spam,
                    Description = "This looks like a dangerous phishing scam link."
                });
            }

            // Assert
            var updatedPost = await _context.Posts.FindAsync(1);
            Assert.Equal(PostStatus.Flagged, updatedPost!.Status);

            var updatedAuthor = await _context.Users.FindAsync(authorId);
            Assert.Equal(35.0, updatedAuthor!.ReputationScore); // 50 - 15 = 35

            var updatedReporter = await _context.Users.FindAsync("reporter1");
            Assert.Equal(55.0, updatedReporter!.ReputationScore); // 50 + 5 = 55
        }

        [Fact]
        public async Task System_ShouldKeepPostPublished_WhenFalseAlarmIsReported()
        {
            // Arrange
            var authorId = "author2";
            _context.Users.Add(new User { CognitoUserId = authorId, UserName = "GoodUser", ReputationScore = 50.0 });
            
            var post = new Post
            {
                Id = 2,
                CognitoUserId = authorId,
                Content = "Właśnie zrobiłem pyszną domową pizzę! Przepis jest świetny.",
                Status = PostStatus.Published
            };
            _context.Posts.Add(post);

            for (int i = 6; i <= 10; i++)
            {
                _context.Users.Add(new User { CognitoUserId = $"reporter{i}", UserName = $"Troll{i}", ReputationScore = 50.0 });
            }
            await _context.SaveChangesAsync();

            // Act
            for (int i = 6; i <= 10; i++)
            {
                await _reportService.CreateReportAsync(2, $"reporter{i}", new CreateReportRequest
                {
                    Reason = ReportReason.HateSpeech,
                    Description = "I hate pizza! Ban this guy!"
                });
            }

            // Assert
            var updatedPost = await _context.Posts.FindAsync(2);
            Assert.Equal(PostStatus.Published, updatedPost!.Status); // Remains published

            var updatedAuthor = await _context.Users.FindAsync(authorId);
            Assert.Equal(50.0, updatedAuthor!.ReputationScore); // Author loses nothing

            var updatedReporter = await _context.Users.FindAsync("reporter6");
            Assert.Equal(47.0, updatedReporter!.ReputationScore); // 50 - 3 = 47
        }
    }
}
