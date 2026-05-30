namespace ModerationSystem.Api.Models.Dto;

public class PostDto
{
    public int Id { get; set; }

    public string UserId { get; set; } = string.Empty;

    public string Content { get; set; } = string.Empty;

    public string Status { get; set; } = string.Empty;

    public DateTime CreatedAt { get; set; }

    public DateTime? UpdatedAt { get; set; }

    public List<CommentDto> Comments { get; set; } = new List<CommentDto>();
}
