using System.ComponentModel.DataAnnotations;

namespace ModerationSystem.Api.Models.Entities;

public class Log : BaseEntity
{
    [Required]
    public string CognitoUserId { get; set; }
    public User User { get; set; }

    public string Content { get; set; }
}
