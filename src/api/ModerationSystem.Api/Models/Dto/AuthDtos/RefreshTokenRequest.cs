using System.ComponentModel.DataAnnotations;

namespace ModerationSystem.Api.Models.Dto.AuthDtos
{
    public class RefreshTokenRequest
    {
        [Required]
        public string RefreshToken { get; set; } = string.Empty;
    }
}