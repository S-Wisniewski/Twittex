using ModerationSystem.Api.Models.Enums;

namespace ModerationSystem.Api.Models.Entities;

public class Post : BaseEntity
{
    public string UserId { get; set; }

    public string Content { get; set; }

    public PostStatus Status { get; set; }

    public ICollection<Comment> Comments { get; set; } = new List<Comment>();
}
