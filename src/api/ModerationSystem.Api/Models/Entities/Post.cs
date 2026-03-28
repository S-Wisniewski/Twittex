using ModerationSystem.Api.Models.Enums;

namespace ModerationSystem.Api.Models.Entities;

public class Post : BaseEntity
{
    public string CognitoUserId { get; set; }

    public virtual User User { get; set; }

    public int? ParentPostId { get; set; }

    public virtual Post? ParentPost { get; set; }

    public string Content { get; set; } = string.Empty;

    public PostStatus Status { get; set; } = PostStatus.Pending;

    public virtual ICollection<PostLikes> Likes { get; set; } = new List<PostLikes>();

    public virtual ICollection<Review> Reviews { get; set; } = new List<Review>();
    // Optional: public virtual ICollection<Comment> Comments { get; set; } = new List<Comment>();
}
