namespace ModerationSystem.Api.Models.Dto.PostDtos
{
    public class PostDto
    {
        public int Id { get; set; }
        public string CognitoUserId { get; set; } = null!;
        public int? ParentPostId { get; set; }
        public string Content { get; set; } = string.Empty;
        public string Status { get; set; } = string.Empty;
    }
}
