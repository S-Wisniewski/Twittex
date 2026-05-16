namespace ModerationSystem.Api.Models.Dto.UserDtos
{
    public class UpdateUserRequest
    {
        public string? DisplayName { get; set; }
        public string? UserName { get; set; }
        public string? Bio { get; set; }
        public string? AvatarUrl { get; set; }
    }
}
