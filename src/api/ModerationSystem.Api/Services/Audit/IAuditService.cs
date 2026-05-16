namespace ModerationSystem.Api.Services.Audit
{
    public interface IAuditService
    {
        void AddLog(string cognitoUserId, string content);
    }
}

