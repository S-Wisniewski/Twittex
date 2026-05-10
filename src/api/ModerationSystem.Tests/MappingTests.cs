using AutoMapper;
using Microsoft.Extensions.Logging.Abstractions;
using ModerationSystem.Api.Mappings;
using ModerationSystem.Api.Models.Dto.PostDtos;
using ModerationSystem.Api.Models.Dto.UserDtos;
using ModerationSystem.Api.Models.Entities;
using Xunit;

namespace ModerationSystem.Tests
{
    public class MappingTests
    {
        private readonly IMapper _mapper;

        public MappingTests()
        {
            var config = new MapperConfiguration(cfg =>
            {
                cfg.AddProfile<MappingProfile>();
            }, NullLoggerFactory.Instance);
            _mapper = config.CreateMapper();
        }

        [Fact]
        public void Configuration_ShouldBeValid()
        {
            var config = new MapperConfiguration(cfg =>
            {
                cfg.AddProfile<MappingProfile>();
            }, NullLoggerFactory.Instance);

            config.AssertConfigurationIsValid();
        }

        [Fact]
        public void Post_To_PostResponse_ShouldMapCorrectly()
        {
            // Arrange
            var user = new User
            {
                CognitoUserId = "user-123",
                UserName = "testuser",
                AvatarUrl = "http://avatar.com"
            };

            var post = new Post
            {
                Id = 1,
                CognitoUserId = "user-123",
                Content = "Hello World",
                User = user,
                CreatedAt = DateTime.UtcNow,
                Likes = new List<PostLikes> { new PostLikes { CognitoUserId = "other-user" } }
            };

            // Act
            var response = _mapper.Map<PostResponse>(post);

            // Assert
            Assert.Equal("1", response.Id);
            Assert.Equal("testuser", response.UserName);
            Assert.Equal("user-123", response.UserId);
            Assert.Equal("Hello World", response.Content);
            Assert.Equal("http://avatar.com", response.UserAvatarUrl);
            Assert.Equal(1, response.LikeCount);
        }

        [Fact]
        public void User_To_UserResponse_ShouldMapCorrectly()
        {
            // Arrange
            var user = new User
            {
                CognitoUserId = "user-123",
                UserName = "testuser",
                Bio = "My Bio",
                AvatarUrl = "http://avatar.com",
                Followers = new List<UserFollows> { new UserFollows() },
                Following = new List<UserFollows> { new UserFollows(), new UserFollows() }
            };

            // Act
            var response = _mapper.Map<UserResponse>(user);

            // Assert
            Assert.Equal("user-123", response.Id);
            Assert.Equal("testuser", response.UserName);
            Assert.Equal("My Bio", response.Content);
            Assert.Equal("http://avatar.com", response.UserAvatarUrl);
            Assert.Equal(1, response.Followers);
            Assert.Equal(2, response.Following);
        }

        [Fact]
        public void Log_To_PostLogResponse_ShouldMapCorrectly()
        {
            // Arrange
            var log = new Log
            {
                Id = 10,
                OldStatus = ModerationSystem.Api.Models.Enums.PostStatus.Pending,
                NewStatus = ModerationSystem.Api.Models.Enums.PostStatus.Published,
                Reason = "Looks good",
                TriggeredBy = "admin-1"
            };

            // Act
            var response = _mapper.Map<PostLogResponse>(log);

            // Assert
            Assert.Equal("10", response.Id);
            Assert.Equal(log.OldStatus, response.OldStatus);
            Assert.Equal(log.NewStatus, response.NewStatus);
            Assert.Equal("Looks good", response.Reason);
            Assert.Equal("admin-1", response.TriggeredBy);
        }
    }
}
