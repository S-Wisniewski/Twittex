using ModerationSystem.Api.Models.Enums;

namespace ModerationSystem.Api.Models.Dto.PostDtos
{
    public class PostReviewRequest
    {
        public ReviewType ReviewType { get; set; }
        public string? Description { get; set; }
    }
}
