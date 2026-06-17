using System.ComponentModel.DataAnnotations;

namespace ModerationSystem.Api.Models.Dto.AuthDtos
{
    public class ChangePasswordRequestDto
    {
        [Required]
        public string CurrentPassword { get; set; } = string.Empty;
        [Required]
        [MinLength(8, ErrorMessage = "New password must be at least 8 characters long.")]
        [RegularExpression(@"^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).+$",
            ErrorMessage = "New password must contain uppercase, number and special character")]
        public string NewPassword { get; set; } = string.Empty;
    }
}