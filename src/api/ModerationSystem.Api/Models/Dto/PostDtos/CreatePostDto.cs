namespace ModerationSystem.Api.Models.Dto.PostDtos
{
    public class CreatePostDto
    {
        public string CognitoUserId { get; set; } = null!;
        public int? ParentPostId { get; set; }
        public string Content { get; set; } = string.Empty;
    }
}
