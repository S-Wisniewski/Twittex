using System.ComponentModel.DataAnnotations;

namespace ModerationSystem.Api.Models.Entities
{
    public class UserFollows
    {
        [Required]
        public string FollowerId { get; set; } = null!;

        public virtual User Follower { get; set; } = null!;

        [Required]
        public string FollowedId { get; set; } = null!;

        public virtual User Followed { get; set; } = null!;

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}
