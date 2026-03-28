namespace ModerationSystem.Api.Models.Dto;

public class PostDto
{
    public int Id { get; set; }

    public string UserId { get; set; }

    public string Content { get; set; }

    public string Status { get; set; }

    public DateTime CreatedAt { get; set; }

    public DateTime? UpdatedAt { get; set; }

    public List<CommentDto> Comments { get; set; } = new List<CommentDto>();
}
