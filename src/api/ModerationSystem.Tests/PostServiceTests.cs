using AutoMapper;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging.Abstractions;
using ModerationSystem.Api.Data;
using ModerationSystem.Api.Mappings;
using ModerationSystem.Api.Models.Dto.PostDtos;
using ModerationSystem.Api.Models.Entities;
using ModerationSystem.Api.Models.Enums;
using ModerationSystem.Api.Services.Ai;
using ModerationSystem.Api.Services.Audit;
using ModerationSystem.Api.Services.Notifications;
using ModerationSystem.Api.Services.Posts;
using Moq;

namespace ModerationSystem.Tests
{
    public class PostServiceTests
    {
        private readonly AppDbContext _context;
        private readonly IMapper _mapper;
        private readonly Mock<IAuditService> _auditMock;
        private readonly Mock<INotificationService> _notificationMock;
        private readonly Mock<IAiService> _aiMock;
        private readonly PostService _postService;

        public PostServiceTests()
        {
            var options = new DbContextOptionsBuilder<AppDbContext>()
                .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
                .Options;

            _context = new AppDbContext(options);

            var mapperConfig = new MapperConfiguration(cfg => {
                cfg.AddProfile<MappingProfile>();
            }, NullLoggerFactory.Instance);
            _mapper = mapperConfig.CreateMapper();

            _auditMock = new Mock<IAuditService>();
            _notificationMock = new Mock<INotificationService>();
            _aiMock = new Mock<IAiService>();

            _postService = new PostService(
                _context, 
                _mapper, 
                _auditMock.Object, 
                _notificationMock.Object, 
                _aiMock.Object);
        }

        [Fact]
        public async Task CreatePost_ShouldSavePost_WhenAiReturnsPublished()
        {
            // Arrange
            _aiMock.Setup(ai => ai.ModerateContentAsync(It.IsAny<string>()))
                   .ReturnsAsync(PostStatus.Published);
            
            var userId = "testUser";
            _context.Users.Add(new User { CognitoUserId = userId, UserName = "Tester" });
            await _context.SaveChangesAsync();

            var request = new CreatePostRequest { Content = "Hello world!" };

            // Act
            var result = await _postService.CreatePostAsync(request, userId);

            // Assert
            Assert.NotNull(result);
            Assert.Equal("Hello world!", result.Content);
            Assert.Equal(PostStatus.Published, result.Status);
            
            var postInDb = await _context.Posts.FirstOrDefaultAsync();
            Assert.NotNull(postInDb);
            Assert.Equal(PostStatus.Published, postInDb.Status);
            
            _auditMock.Verify(a => a.AddLog(userId, It.IsAny<string>()), Times.Once);
        }

        [Fact]
        public async Task CreatePost_ShouldHidePost_WhenAiReturnsFlagged()
        {
            // Arrange
            _aiMock.Setup(ai => ai.ModerateContentAsync(It.IsAny<string>()))
                   .ReturnsAsync(PostStatus.Flagged);
            
            var userId = "testUser";
            _context.Users.Add(new User { CognitoUserId = userId, UserName = "BadUser" });
            await _context.SaveChangesAsync();

            var request = new CreatePostRequest { Content = "Some toxic content" };

            // Act
            var result = await _postService.CreatePostAsync(request, userId);

            // Assert
            Assert.Equal(PostStatus.Flagged, result.Status);
            
            var postInDb = await _context.Posts.FirstOrDefaultAsync();
            Assert.Equal(PostStatus.Flagged, postInDb!.Status);
        }

        [Fact]
        public async Task LikePost_ShouldAddLike_IfUserHasNotLikedPost()
        {
            // Arrange
            var userId = "user1";
            var post = new Post { Id = 1, CognitoUserId = "author1", Content = "Nice post" };
            _context.Posts.Add(post);
            await _context.SaveChangesAsync();

            // Act
            var success = await _postService.LikePostAsync(1, userId);

            // Assert
            Assert.True(success);
            var likeInDb = await _context.PostLikes.FirstOrDefaultAsync(l => l.PostId == 1 && l.CognitoUserId == userId);
            Assert.NotNull(likeInDb);
        }

        [Fact]
        public async Task UnlikePost_ShouldRemoveLike_IfUserLiked()
        {
            // Arrange
            var userId = "user1";
            var post = new Post { Id = 1, CognitoUserId = "author1", Content = "Nice post" };
            _context.Posts.Add(post);
            _context.PostLikes.Add(new PostLikes { PostId = 1, CognitoUserId = userId });
            await _context.SaveChangesAsync();

            // Act
            var success = await _postService.UnlikePostAsync(1, userId);

            // Assert
            Assert.True(success);
            var likeInDb = await _context.PostLikes.FirstOrDefaultAsync(l => l.PostId == 1 && l.CognitoUserId == userId);
            Assert.Null(likeInDb);
        }

        [Fact]
        public async Task GetFeed_ShouldReturnPosts_WithCorrectIsLikedStatus()
        {
            // Arrange
            var currentUserId = "viewer1";
            _context.Users.Add(new User { CognitoUserId = "author1", UserName = "Author" });

            var post1 = new Post { Id = 1, CognitoUserId = "author1", Content = "Post A" };
            var post2 = new Post { Id = 2, CognitoUserId = "author1", Content = "Post B" };
            
            _context.Posts.Add(post1);
            _context.Posts.Add(post2);
            
            // Viewer liked Post 1 but not Post 2
            _context.PostLikes.Add(new PostLikes { PostId = 1, CognitoUserId = currentUserId });
            await _context.SaveChangesAsync();

            // Act
            var feed = (await _postService.GetFeedAsync(1, 10, currentUserId)).ToList();

            // Assert
            Assert.Equal(2, feed.Count);
            var mappedPost1 = feed.First(p => p.Id == "1");
            var mappedPost2 = feed.First(p => p.Id == "2");

            Assert.True(mappedPost1.IsLiked);
            Assert.False(mappedPost2.IsLiked);
        }
    }
}
