namespace ModerationSystem.Api.Models.Entities
{
    public class Review : BaseEntity
    {
        public int PostId { get; set; }

        public virtual Post Post { get; set; }

        // user who flagged the post
        public string CognitoUserId { get; set; }

        public virtual User User { get; set; }

        // reason for flagging the post
        public string Description { get; set; }
        // possible enum
        public string Type { get; set; }
    }
}
