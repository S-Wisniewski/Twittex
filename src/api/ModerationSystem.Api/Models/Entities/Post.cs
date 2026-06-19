using ModerationSystem.Api.Models.Enums;
using System.ComponentModel.DataAnnotations;

namespace ModerationSystem.Api.Models.Entities
{
    public class Post : BaseEntity
    {
        [Required]
        public string CognitoUserId { get; set; } = null!;

        public User User { get; set; } = null!;

        public int? ParentPostId { get; set; }

        public Post? ParentPost { get; set; }

        public ICollection<Post> Replies { get; set; } = new List<Post>();

        [Required(ErrorMessage = "Post content cannot be empty.")]
        [StringLength(2000, MinimumLength = 1, ErrorMessage = "Content must be between 1 and 2000 characters.")]
        public string Content { get; set; } = string.Empty;

        [Required]
        [EnumDataType(typeof(PostStatus))]
        public PostStatus Status { get; set; } = PostStatus.Pending;

        public ICollection<PostLikes> Likes { get; set; } = new List<PostLikes>();

        public ICollection<PostBookmarks> Bookmarks { get; set; } = new List<PostBookmarks>();

        public ICollection<Log> Logs { get; set; } = new List<Log>();
    }
}