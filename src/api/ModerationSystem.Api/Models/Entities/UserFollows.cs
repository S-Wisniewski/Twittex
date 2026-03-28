using System.ComponentModel.DataAnnotations;

namespace ModerationSystem.Api.Models.Entities
{
    public class UserFollows
    {
        [Required]
        public string FollowerId { get; set; }
        public virtual User Follower { get; set; }

        [Required]
        public string FollowedId { get; set; }
        public virtual User Followed { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}
