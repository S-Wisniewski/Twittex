using ModerationSystem.Api.Models.Dto.AuthDtos;

namespace ModerationSystem.Api.Services.Auth
{
    public interface IAuthService
    {
        Task<bool> SignUpAsync(SignUpRequest request);
        Task<bool> ConfirmEmailAsync(string userName, string confirmationCode);
        Task<TokenResponse?> LogInAsync(LoginRequest request);
        Task<TokenResponse?> RefreshTokenAsync(string refreshToken);
        Task LogOutAsync(string accessToken);
        Task<bool> ChangePasswordAsync(string accessToken, ChangePasswordRequestDto request);
    }
}
