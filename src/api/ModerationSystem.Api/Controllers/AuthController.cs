using Microsoft.AspNetCore.Mvc;
using ModerationSystem.Api.Models.Dto.AuthDtos;
using ModerationSystem.Api.Services.Auth;

namespace ModerationSystem.Api.Controllers
{
    [ApiController]
    [Route("api/auth")]
    public class AuthController : ControllerBase
    {
        private readonly IAuthService _authService;

        public AuthController(IAuthService authService)
        {
            _authService = authService;
        }

        [HttpPost("sign-up")]
        public async Task<IActionResult> SignUp([FromBody] SignUpRequest request)
        {
            var success = await _authService.SignUpAsync(request);
            if (!success) return BadRequest("Could not sign up user.");

            return Ok("User registered successfully. Please confirm your email.");
        }

        [HttpPost("confirm-email")]
        public async Task<IActionResult> ConfirmEmail([FromBody] ConfirmEmailRequest request)
        {
            var success = await _authService.ConfirmEmailAsync(request.Email, request.ConfirmationCode);
            if (!success) return BadRequest("Could not confirm email. Invalid code or username.");

            return Ok("Email confirmed successfully. You can now log in.");
        }

        [HttpPost("log-in")]
        public async Task<ActionResult<TokenResponse>> LogIn([FromBody] LoginRequest request)
        {
            var response = await _authService.LogInAsync(request);
            if (response == null) return Unauthorized("Invalid username or password.");

            return Ok(response);
        }

        [HttpPost("refresh-token")]
        public async Task<ActionResult<TokenResponse>> RefreshToken([FromQuery] string refreshToken)
        {
            var response = await _authService.RefreshTokenAsync(refreshToken);
            if (response == null) return Unauthorized("Invalid refresh token.");

            return Ok(response);
        }

        [HttpPost("log-out")]
        public async Task<IActionResult> LogOut([FromHeader(Name = "Authorization")] string authorization)
        {
            if (string.IsNullOrEmpty(authorization) || !authorization.StartsWith("Bearer "))
            {
                return BadRequest("Invalid authorization header.");
            }

            var accessToken = authorization.Substring(7);
            await _authService.LogOutAsync(accessToken);
            return Ok();
        }
    }
}
