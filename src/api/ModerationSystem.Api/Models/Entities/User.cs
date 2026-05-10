using System.ComponentModel.DataAnnotations;

namespace ModerationSystem.Api.Models.Entities
{
    public class User
    {
        [Key]
        [Required]
        public string CognitoUserId { get; set; } = null!;

        [Required]
        public string UserName { get; set; } = string.Empty;

        public string? DisplayName { get; set; }

        public string? Bio { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        [Url]
        [MaxLength(2048)]
        public string? AvatarUrl { get; set; }

        public ICollection<Post> Posts { get; set; } = new List<Post>();

        public ICollection<PostLikes> LikedPosts { get; set; } = new List<PostLikes>();

        public ICollection<UserFollows> Followers { get; set; } = new List<UserFollows>();

        public ICollection<UserFollows> Following { get; set; } = new List<UserFollows>();

        public ICollection<Review> Reviews { get; set; } = new List<Review>();

        public ICollection<Log> Logs { get; set; } = new List<Log>();
    }
}
