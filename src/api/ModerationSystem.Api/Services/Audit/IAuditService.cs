namespace ModerationSystem.Api.Services.Audit;

public interface IAuditService
{
    Task LogAsync(string cognitoUserId, string content);
}
