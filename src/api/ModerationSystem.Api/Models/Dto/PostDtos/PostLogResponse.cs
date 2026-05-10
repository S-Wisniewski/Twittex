using ModerationSystem.Api.Models.Enums;

namespace ModerationSystem.Api.Models.Dto.PostDtos
{
    public class PostLogResponse
    {
        public string Id { get; set; } = string.Empty;
        public PostStatus OldStatus { get; set; }
        public PostStatus NewStatus { get; set; }
        public string Reason { get; set; } = string.Empty;
        public string TriggeredBy { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; }
    }
}
