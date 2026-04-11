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

        public async Task LogAsync(string cognitoUserId, string content)
        {
            var log = new Log
            {
                CognitoUserId = cognitoUserId,
                Content = content
            };

            await _db.AddAsync(log);
            await _db.SaveChangesAsync();
        }
    }
}

