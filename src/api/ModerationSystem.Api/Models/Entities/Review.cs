using ModerationSystem.Api.Models.Enums;
using System.ComponentModel.DataAnnotations;

namespace ModerationSystem.Api.Models.Entities
{
    public class Review : BaseEntity
    {
        [Required]
        public int PostId { get; set; }
        public virtual Post Post { get; set; }

        // user who flagged the post
        [Required]
        public string CognitoUserId { get; set; }
        public virtual User User { get; set; }

        // reason for flagging the post
        public string? Description { get; set; }

        [Required]
        [EnumDataType(typeof(ReviewType))]
        public ReviewType ReviewType { get; set; }
    }
}
