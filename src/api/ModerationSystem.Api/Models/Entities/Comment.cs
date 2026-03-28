namespace ModerationSystem.Api.Models.Entities;

public class Comment : BaseEntity
{
    public string CognitoUserId { get; set; }

    public User User { get; set; }

    public int PostId { get; set; }

    public Post Post { get; set; }

    public int? ParentId { get; set; }

    public Comment Parent { get; set; }

    public string Content { get; set; }

    public ICollection<Comment> Replies { get; set; } = new List<Comment>();
}
