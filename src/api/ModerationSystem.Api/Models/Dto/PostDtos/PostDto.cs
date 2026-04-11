namespace ModerationSystem.Api.Models.Dto.PostDtos
{
    public class PostDto
    {
        public int Id { get; set; }
        public string CognitoUserId { get; set; }
        public int? ParentPostId { get; set; }
        public string Content { get; set; }
        public string Status { get; set; }
    }
}
