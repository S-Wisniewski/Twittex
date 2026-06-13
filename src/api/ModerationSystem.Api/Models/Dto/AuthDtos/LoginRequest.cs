using System.ComponentModel.DataAnnotations;

namespace ModerationSystem.Api.Models.Dto.AuthDtos
{
    public class LoginRequest
    {
        [Required]
        [EmailAddress]
        public string Email { get; set; } = string.Empty;
        [Required]
        public string Password { get; set; } = string.Empty;
    }
}
