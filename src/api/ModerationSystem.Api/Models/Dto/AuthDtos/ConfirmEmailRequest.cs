namespace ModerationSystem.Api.Models.Dto.AuthDtos
{
    public class ConfirmEmailRequest
    {
        public string Email { get; set; } = string.Empty;
        public string ConfirmationCode { get; set; } = string.Empty;
    }
}
