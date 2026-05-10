namespace ModerationSystem.Api.Models.Dto.PostDtos
{
    public class CreatePostRequest
    {
        public string Content { get; set; } = string.Empty;
        public int? ParentPostId { get; set; }
    }
}
