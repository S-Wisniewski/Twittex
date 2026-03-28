namespace ModerationSystem.Api.Models.Entities
{
    public class UserFollows
    {
        public string FollowerId { get; set; }
        public virtual User Follower { get; set; }

        public string FollowedId { get; set; }
        public virtual User Followed { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}
