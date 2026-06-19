namespace ModerationSystem.Api.Models.Dto.PostDtos
{
    public class ReplyThreadResponse
    {
        public List<PostResponse> Ancestors { get; set; } = [];
        public PostResponse Reply { get; set; } = null!;
    }
}
