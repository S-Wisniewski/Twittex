using Microsoft.AspNetCore.SignalR;
using ModerationSystem.Api.Hubs;
using ModerationSystem.Api.Models.Entities;

namespace ModerationSystem.Api.Services.Notifications
{
    public class NotificationService : INotificationService
    {
        private readonly IHubContext<NotificationHub> _hub;
        private readonly ILogger<NotificationService> _logger;

        public NotificationService(
            IHubContext<NotificationHub> hub,
            ILogger<NotificationService> logger)
        {
            _hub = hub;
            _logger = logger;
        }

        public async Task NotifyModeratorsOfPendingPost(Post post)
        {
            try
            {
                await _hub.Clients.Group("moderators")
                    .SendAsync("PostPending", new
                    {
                        post.Id,
                        Status = post.Status.ToString()
                    });
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex,
                    "Failed to notify moderators about pending post {PostId}",
                    post.Id);
            }
        }

        public async Task NotifyUserOfPostStatusChange(Post post, string? oldStatus = null, string? reason = null, string triggeredBy = "system")
        {
            try
            {
                var excerpt = post.Content.Length > 100
                    ? post.Content[..100] + "…"
                    : post.Content;

                await _hub.Clients.User(post.CognitoUserId)
                    .SendAsync("PostStatusChanged", new
                    {
                        Id = post.Id.ToString(),
                        PostExcerpt = excerpt,
                        OldStatus = oldStatus,
                        NewStatus = post.Status.ToString(),
                        Reason = reason,
                        TriggeredBy = triggeredBy,
                    });
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex,
                    "Failed to notify user {CognitoUserId} about post status change",
                    post.CognitoUserId);
            }
        }
    }
}