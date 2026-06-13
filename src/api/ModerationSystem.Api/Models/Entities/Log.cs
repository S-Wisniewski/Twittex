using ModerationSystem.Api.Models.Enums;
using System.ComponentModel.DataAnnotations;

namespace ModerationSystem.Api.Models.Entities
{
    public class Log : BaseEntity
    {
        public int? PostId { get; set; }
        public Post? Post { get; set; }

        [Required]
        public string CognitoUserId { get; set; } = null!;

        public User User { get; set; } = null!;

        public string Content { get; set; } = string.Empty;

        public PostStatus OldStatus { get; set; }
        public PostStatus NewStatus { get; set; }
        public string Reason { get; set; } = string.Empty;
        public string TriggeredBy { get; set; } = string.Empty;
    }
}