using ModerationSystem.Api.Data;
using ModerationSystem.Api.Models.Entities;
using ModerationSystem.Api.Models.Enums;

namespace ModerationSystem.Api.Services.Audit
{
    public class AuditService : IAuditService
    {
        private readonly AppDbContext _db;

        public AuditService(AppDbContext db)
        {
            _db = db;
        }

        public void AddLog(string cognitoUserId, string content)
        {
            _db.Add(new Log { CognitoUserId = cognitoUserId, Content = content });
        }

        public void AddStatusLog(string cognitoUserId, int postId, PostStatus oldStatus, PostStatus newStatus, string reason, string triggeredBy)
        {
            _db.Add(new Log
            {
                CognitoUserId = cognitoUserId,
                PostId = postId,
                OldStatus = oldStatus,
                NewStatus = newStatus,
                Reason = reason,
                TriggeredBy = triggeredBy,
                Content = $"{oldStatus} → {newStatus}",
            });
        }
    }
}

