using ModerationSystem.Api.Models.Enums;
using System.ComponentModel.DataAnnotations;

namespace ModerationSystem.Api.Models.Entities
{
    public class Report : BaseEntity
    {
        public int PostId { get; set; }
        public Post Post { get; set; } = null!;

        [Required]
        public string CognitoUserId { get; set; } = null!;
        public User User { get; set; } = null!;

        public ReportReason Reason { get; set; }

        [MaxLength(500)]
        public string? Description { get; set; }

        public double Weight { get; set; }
    }
}
