namespace ModerationSystem.Api.Models.Dto.PostDtos
{
    public class CreatePostDto
    {
        public string CognitoUserId { get; set; }
        public int? ParentPostId { get; set; }
        public string Content { get; set; }
    }
}
