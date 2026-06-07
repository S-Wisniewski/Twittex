using Amazon;
using Amazon.CognitoIdentityProvider;
using Amazon.CognitoIdentityProvider.Model;
using Microsoft.EntityFrameworkCore;
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

        public AuthService(IConfiguration configuration, AppDbContext context)
        {
            _configuration = configuration;
            _context = context;
            _clientId = _configuration["Cognito:Audience"]!;

            var regionStr = _configuration["Cognito:Region"] ?? "eu-central-1";
            var region = RegionEndpoint.GetBySystemName(regionStr);
            _cognitoClient = new AmazonCognitoIdentityProviderClient(region);
        }

        public async Task<bool> SignUpAsync(Models.Dto.AuthDtos.SignUpRequest request)
        {
            try
            {
                var signUpRequest = new Amazon.CognitoIdentityProvider.Model.SignUpRequest
                {
                    ClientId = _clientId,
                    Username = request.UserName,
                    Password = request.Password,
                    UserAttributes = new List<AttributeType>
                    {
                        new AttributeType { Name = "email", Value = request.Email }
                    }
                };

                var response = await _cognitoClient.SignUpAsync(signUpRequest);

                // Add to our database
                var user = new User
                {
                    CognitoUserId = response.UserSub,
                    UserName = request.UserName,
                    DisplayName = request.DisplayName ?? request.UserName,
                    Bio = request.Bio,
                    CreatedAt = DateTime.UtcNow
                };

                _context.Users.Add(user);
                await _context.SaveChangesAsync();

                return true;
            }
            catch (Exception)
            {
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
                        { "USERNAME", request.UserName },
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
            catch (Exception)
            {
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
            catch (Exception)
            {
                // Log error
            }
        }
    }
}
