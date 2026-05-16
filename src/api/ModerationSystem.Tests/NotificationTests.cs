using Xunit;
using Moq;
using Microsoft.AspNetCore.SignalR;
using System.Threading.Tasks;
using ModerationSystem.Api.Services.Notifications;
using ModerationSystem.Api.Hubs;
using ModerationSystem.Api.Models.Entities;
using ModerationSystem.Api.Models.Enums;
using Microsoft.Extensions.Logging;

namespace ModerationSystem.Tests
{
    public class NotificationTests
    {
        [Fact]
        public async Task ModerationService_NotifyModerators_SendsCorrectMessageToGroup()
        {
            // arrange
            var groupName = "moderators";

            object[] capturedArgs = [];

            var clientProxyMock = new Mock<IClientProxy>();

            clientProxyMock
                .Setup(x => x.SendCoreAsync(
                    "PostPending",
                    It.IsAny<object[]>(),
                    default))
                .Callback<string, object[], object>((method, args, token) =>
                {
                    capturedArgs = args;
                })
                .Returns(Task.CompletedTask);

            var hubClientsMock = new Mock<IHubClients>();
            hubClientsMock
                .Setup(x => x.Group(groupName))
                .Returns(clientProxyMock.Object);

            var hubContextMock = new Mock<IHubContext<NotificationHub>>();

            hubContextMock
                .Setup(x => x.Clients)
                .Returns(hubClientsMock.Object);

            var loggerMock = new Mock<ILogger<NotificationService>>();

            var service = new NotificationService(hubContextMock.Object, loggerMock.Object);

            var post = new Post
            {
                Id = 123,
                Status = PostStatus.Pending
            };

            // act
            await service.NotifyModeratorsOfPendingPost(post);

            // assert - podstawowe
            Assert.NotNull(capturedArgs);
            Assert.Single(capturedArgs);

            // assert - content
            var payload = capturedArgs[0];

            var json = System.Text.Json.JsonSerializer.Serialize(payload);
            var dict = System.Text.Json.JsonSerializer.Deserialize<Dictionary<string, object>>(json);

            Assert.NotNull(dict);
            Assert.Equal("123", dict["Id"].ToString());
            Assert.Equal("Pending", dict["Status"].ToString());
        }
    }
}