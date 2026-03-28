namespace ModerationSystem.Api.Models.Entities
{
    public class PostLikes
    {
        public string CognitoUserId { get; set; }

        public virtual User User { get; set; }

        public int PostId { get; set; }

        public virtual Post Post { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}
