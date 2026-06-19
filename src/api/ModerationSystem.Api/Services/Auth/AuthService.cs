using Amazon.CognitoIdentityProvider;
using Amazon.CognitoIdentityProvider.Model;
using ModerationSystem.Api.Data;
using ModerationSystem.Api.Models.Dto.AuthDtos;
using ModerationSystem.Api.Models.Entities;

namespace ModerationSystem.Api.Services.Auth
{
    public class AuthService : IAuthService
    {
        private readonly IAmazonCognitoIdentityProvider _cognitoClient;
        private readonly AppDbContext _context;
        private readonly IConfiguration _configuration;
        private readonly string _clientId;
        private readonly ILogger<AuthService> _logger;

        public AuthService(
            IConfiguration configuration,
            AppDbContext context,
            IAmazonCognitoIdentityProvider cognitoClient,
            ILogger<AuthService> logger)
        {
            _configuration = configuration;
            _context = context;
            _clientId = _configuration["Cognito:Audience"]!;
            _cognitoClient = cognitoClient;
            _logger = logger;
        }

        public async Task<bool> SignUpAsync(Models.Dto.AuthDtos.SignUpRequest request)
        {
            try
            {
                var signUpRequest = new Amazon.CognitoIdentityProvider.Model.SignUpRequest
                {
                    ClientId = _clientId,
                    Username = request.Email,
                    Password = request.Password,
                    UserAttributes = new List<AttributeType>
                    {
                        new AttributeType { Name = "email", Value = request.Email },
                    }
                };

                var response = await _cognitoClient.SignUpAsync(signUpRequest);

                var user = new User
                {
                    CognitoUserId = response.UserSub,
                    Email = request.Email.ToLower().Trim(),
                    UserName = request.Username,
                    CreatedAt = DateTime.UtcNow
                };

                _context.Users.Add(user);
                await _context.SaveChangesAsync();

                return true;
            }
            catch (UsernameExistsException ex)
            {
                _logger.LogWarning(ex, "User already exists: {Email}", request.Email);
                return false;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "SignUp failed for {Email}", request.Email);
                return false;
            }
        }

        public async Task<bool> ConfirmEmailAsync(string userName, string confirmationCode)
        {
            try
            {
                var confirmRequest = new ConfirmSignUpRequest
                {
                    ClientId = _clientId,
                    Username = userName,
                    ConfirmationCode = confirmationCode
                };

                await _cognitoClient.ConfirmSignUpAsync(confirmRequest);
                return true;
            }
            catch (Exception)
            {
                return false;
            }
        }

        public async Task<TokenResponse?> LogInAsync(LoginRequest request)
        {
            try
            {
                var authRequest = new InitiateAuthRequest
                {
                    AuthFlow = AuthFlowType.USER_PASSWORD_AUTH,
                    ClientId = _clientId,
                    AuthParameters = new Dictionary<string, string>
                    {
                        { "USERNAME", request.Email },
                        { "PASSWORD", request.Password }
                    }
                };

                var response = await _cognitoClient.InitiateAuthAsync(authRequest);

                return new TokenResponse
                {
                    AccessToken = response.AuthenticationResult.AccessToken,
                    IdToken = response.AuthenticationResult.IdToken,
                    RefreshToken = response.AuthenticationResult.RefreshToken,
                    ExpiresIn = response.AuthenticationResult.ExpiresIn ?? 0
                };
            }
            catch (Exception exc)
            {
                Console.WriteLine(exc);
                return null;
            }
        }

        public async Task<TokenResponse?> RefreshTokenAsync(string refreshToken)
        {
            try
            {
                var authRequest = new InitiateAuthRequest
                {
                    AuthFlow = AuthFlowType.REFRESH_TOKEN_AUTH,
                    ClientId = _clientId,
                    AuthParameters = new Dictionary<string, string>
                    {
                        { "REFRESH_TOKEN", refreshToken }
                    }
                };

                var response = await _cognitoClient.InitiateAuthAsync(authRequest);

                return new TokenResponse
                {
                    AccessToken = response.AuthenticationResult.AccessToken,
                    IdToken = response.AuthenticationResult.IdToken,
                    RefreshToken = refreshToken, // Refresh token is usually not rotated in this flow
                    ExpiresIn = response.AuthenticationResult.ExpiresIn ?? 0
                };
            }
            catch (Exception)
            {
                return null;
            }
        }

        public async Task LogOutAsync(string accessToken)
        {
            try
            {
                var logOutRequest = new GlobalSignOutRequest
                {
                    AccessToken = accessToken
                };

                await _cognitoClient.GlobalSignOutAsync(logOutRequest);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Logout failed");
            }
        }

        public async Task<bool> ChangePasswordAsync(
            string accessToken,
            ChangePasswordRequestDto request)
        {
            try
            {
                await _cognitoClient.ChangePasswordAsync(new ChangePasswordRequest
                {
                    AccessToken = accessToken,
                    PreviousPassword = request.CurrentPassword,
                    ProposedPassword = request.NewPassword
                });
                return true;
            }
            catch (NotAuthorizedException ex)
            {
                _logger.LogWarning(ex, "Unauthorized password change attempt");
                return false;
            }
            catch (InvalidPasswordException ex)
            {
                _logger.LogWarning(ex, "Invalid password provided");
                return false;
            }
            catch (PasswordHistoryPolicyViolationException ex)
            {
                _logger.LogWarning(ex, "Password reuse attempt");
                return false;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Unexpected error in ChangePassword");
                return false;
            }
        }
    }
}
