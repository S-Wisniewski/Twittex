namespace ModerationSystem.Api.Models.Dto.AuthDtos
{
    public class TokenResponse
    {
        public string AccessToken { get; set; } = string.Empty;
        public string IdToken { get; set; } = string.Empty;
        public string RefreshToken { get; set; } = string.Empty;
        public int ExpiresIn { get; set; }
    }

    public class LoginRequest
    {
        public string UserName { get; set; } = string.Empty;
        public string Password { get; set; } = string.Empty;
    }

    public class SignUpRequest
    {
        public string UserName { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string Password { get; set; } = string.Empty;
        public string? DisplayName { get; set; }
        public string? Bio { get; set; }
    }

    public class ConfirmEmailRequest
    {
        public string UserName { get; set; } = string.Empty;
        public string ConfirmationCode { get; set; } = string.Empty;
    }
}
