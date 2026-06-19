using ModerationSystem.Api.Models.Enums;

namespace ModerationSystem.Api.Models.Dto.PostDtos
{
    public class PostResponse
    {
        public string Id { get; set; } = string.Empty;
        public string UserName { get; set; } = string.Empty;
        public string UserId { get; set; } = string.Empty;
        public int? ParentPostId { get; set; }
        public string? ParentUserName { get; set; }
        public DateTime CreatedAt { get; set; }
        public string Content { get; set; } = string.Empty;
        public string UserAvatarUrl { get; set; } = string.Empty;
        public bool IsLiked { get; set; }
        public PostStatus Status { get; set; }
        public int LikeCount { get; set; }
        public int CommentCount { get; set; }
    }
}
