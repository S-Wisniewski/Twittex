using ModerationSystem.Api.Models.Enums;

namespace ModerationSystem.Api.Models.Entities;

public class Post : BaseEntity
{
    public int UserId { get; set; }
    public virtual User User { get; set; }

    public int? ParentPostId { get; set; }
    public virtual Post? ParentPost { get; set; }

    public string Content { get; set; }
    public PostStatus Status { get; set; } = PostStatus.Pending;

    // public ICollection<Comment> Comments { get; set; } = new List<Comment>();
    public virtual ICollection<PostLikes> Likes { get; set; } = new List<PostLikes>();
    public virtual ICollection<Review> Reviews { get; set; } = new List<Review>();
}
