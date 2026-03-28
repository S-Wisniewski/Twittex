namespace ModerationSystem.Api.Models.Dto;

public class CommentDto
{
    public int Id { get; set; }

    public string UserId { get; set; }

    public int PostId { get; set; }

    public int? ParentId { get; set; }

    public string Content { get; set; }

    public DateTime CreatedAt { get; set; }

    public DateTime? UpdatedAt { get; set; }

    public List<CommentDto> Replies { get; set; } = new List<CommentDto>();
}
