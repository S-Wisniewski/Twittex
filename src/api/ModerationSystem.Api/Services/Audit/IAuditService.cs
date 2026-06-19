using ModerationSystem.Api.Models.Enums;

namespace ModerationSystem.Api.Services.Audit
{
    public interface IAuditService
    {
        void AddLog(string cognitoUserId, string content);
        void AddStatusLog(string cognitoUserId, int postId, PostStatus oldStatus, PostStatus newStatus, string reason, string triggeredBy);
    }
}

