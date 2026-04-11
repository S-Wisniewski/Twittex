using System.ComponentModel.DataAnnotations;

namespace ModerationSystem.Api.Models.Entities
{
    public class Log : BaseEntity
    {
        [Required]
        public string CognitoUserId { get; set; } = null!;

        public User User { get; set; } = null!;

        public string Content { get; set; } = string.Empty;
    }
}


