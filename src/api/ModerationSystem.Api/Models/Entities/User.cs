using System.ComponentModel.DataAnnotations;

namespace ModerationSystem.Api.Models.Entities
{
        public class User
        {
                [Key]
                [Required]
                public string CognitoUserId { get; set; } = null!;
                [Required]
                [MaxLength(254)]
                public string Email { get; set; } = string.Empty;
                [Required]
                [MaxLength(30)]
                public string UserName { get; set; } = string.Empty;
                [MaxLength(50)]
                public string? DisplayName { get; set; }
                [MaxLength(500)]
                public string? Bio { get; set; }
                public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
                [Url]
                [MaxLength(2048)]
                public string? AvatarUrl { get; set; }
                public ICollection<Post> Posts { get; set; } = new List<Post>();
                public ICollection<PostLikes> LikedPosts { get; set; } = new List<PostLikes>();
                public ICollection<UserFollows> Followers { get; set; } = new List<UserFollows>();
                public ICollection<UserFollows> Following { get; set; } = new List<UserFollows>();
                public ICollection<Log> Logs { get; set; } = new List<Log>();
                public double ReputationScore { get; set; } = 50.0;
        }
}