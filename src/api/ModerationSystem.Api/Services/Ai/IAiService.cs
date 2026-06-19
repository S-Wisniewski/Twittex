using ModerationSystem.Api.Models.Enums;

namespace ModerationSystem.Api.Services.Ai
{
    public interface IAiService
    {
        Task<PostStatus> ModerateContentAsync(string content);
        Task<PostStatus> ReevaluatePostAsync(string content, string reportContext);
    }
}
