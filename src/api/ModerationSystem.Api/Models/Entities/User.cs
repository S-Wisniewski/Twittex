using System.ComponentModel.DataAnnotations;

namespace ModerationSystem.Api.Models.Entities
{
    public class User
    {
        [Required]
        public string CognitoUserId { get; set; } = string.Empty;

        [Url]
        [MaxLength(2048)]
        public string? AvatarUrl { get; set; }

        public virtual ICollection<Post> Posts { get; set; } = new List<Post>();
        public virtual ICollection<PostLikes> LikedPosts { get; set; } = new List<PostLikes>();
        public virtual ICollection<UserFollows> Followers { get; set; } = new List<UserFollows>();
        public virtual ICollection<UserFollows> Following { get; set; } = new List<UserFollows>();
        public virtual ICollection<Review> Reviews { get; set; } = new List<Review>();
        public virtual ICollection<Log> Logs { get; set; } = new List<Log>();
    }
}
