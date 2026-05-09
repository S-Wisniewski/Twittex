using ModerationSystem.Api.Models.Enums;
using System.ComponentModel.DataAnnotations;

namespace ModerationSystem.Api.Models.Entities;

public class Post : BaseEntity
{
    [Required]
    public string CognitoUserId { get; set; }
    public virtual User User { get; set; }

    public int? ParentPostId { get; set; }
    public virtual Post? ParentPost { get; set; }


    [Required(ErrorMessage = "Post content cannot be empty.")]
    [StringLength(2000, MinimumLength = 1, ErrorMessage = "Content must be between 1 and 2000 characters.")]
    public string Content { get; set; } = string.Empty;


    [Required]
    [EnumDataType(typeof(PostStatus))]
    public PostStatus Status { get; set; } = PostStatus.Pending;

    public virtual ICollection<PostLikes> Likes { get; set; } = new List<PostLikes>();
    public virtual ICollection<Review> Reviews { get; set; } = new List<Review>();
}
