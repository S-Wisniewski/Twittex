namespace ModerationSystem.Api.Models.Dto.AuthDtos
{
    public class SignUpRequest
    {
        public string UserName { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string Password { get; set; } = string.Empty;
        public string? DisplayName { get; set; }
        public string? Bio { get; set; }
    }
}
