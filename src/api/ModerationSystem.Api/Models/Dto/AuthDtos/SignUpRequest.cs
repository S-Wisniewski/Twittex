using System.ComponentModel.DataAnnotations;

namespace ModerationSystem.Api.Models.Dto.AuthDtos
{
    public class SignUpRequest
    {
        [Required]
        [EmailAddress]
        public string Email { get; set; } = string.Empty;
        [Required]
        [MinLength(8, ErrorMessage = "Password must be at least 8 characters long.")]
        [RegularExpression(@"^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).+$",
            ErrorMessage = "Password must contain uppercase, number and special character")]
        public string Password { get; set; } = string.Empty;
    }
}
