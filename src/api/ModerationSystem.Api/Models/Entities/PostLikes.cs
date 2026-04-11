using System.ComponentModel.DataAnnotations;

namespace ModerationSystem.Api.Models.Entities
{
    public class PostLikes
    {
        [Required]
        public string CognitoUserId { get; set; } = null!;

        public virtual User User { get; set; } = null!;

        [Required]
        public int PostId { get; set; }

        public virtual Post Post { get; set; } = null!;

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}
