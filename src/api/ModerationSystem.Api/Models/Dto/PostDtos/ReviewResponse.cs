using ModerationSystem.Api.Models.Enums;

namespace ModerationSystem.Api.Models.Dto.PostDtos
{
    public class ReviewResponse
    {
        public string Id { get; set; } = string.Empty;
        public int PostId { get; set; }
        public string CognitoUserId { get; set; } = string.Empty;
        public string? Description { get; set; }
        public ReviewType ReviewType { get; set; }
        public DateTime CreatedAt { get; set; }
    }
}
