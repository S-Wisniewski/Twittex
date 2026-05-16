using ModerationSystem.Api.Data;
using ModerationSystem.Api.Models.Entities;

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
            var log = new Log
            {
                CognitoUserId = cognitoUserId,
                Content = content
            };

            _db.Add(log);
        }
    }
}

