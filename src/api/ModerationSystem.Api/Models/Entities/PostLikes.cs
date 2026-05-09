using System.ComponentModel.DataAnnotations;

namespace ModerationSystem.Api.Models.Entities
{
    public class PostLikes
    {
        [Required]
        public string CognitoUserId { get; set; }
        public virtual User User { get; set; }

        [Required]
        public int PostId { get; set; }
        public virtual Post Post { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}
