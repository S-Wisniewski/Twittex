namespace ModerationSystem.Api.Models.Entities;

public class Log : BaseEntity
{
    public string UserId { get; set; }

    public string Content { get; set; }
}
