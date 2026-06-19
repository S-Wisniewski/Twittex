using ModerationSystem.Api.Models.Entities;

namespace ModerationSystem.Api.Services.Notifications
{
    public interface INotificationService
    {
        Task NotifyModeratorsOfPendingPost(Post post);
        Task NotifyUserOfPostStatusChange(Post post, string? oldStatus = null, string? reason = null, string triggeredBy = "system");
    }
}