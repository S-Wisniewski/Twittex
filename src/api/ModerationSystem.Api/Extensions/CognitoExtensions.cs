using Amazon;
using Amazon.CognitoIdentityProvider;
using Amazon.Runtime;

namespace ModerationSystem.Api.Extensions
{
    public static class CognitoExtensions
    {
        public static IServiceCollection AddCognitoClient(
            this IServiceCollection services,
            IConfiguration configuration)
        {
            services.AddSingleton<IAmazonCognitoIdentityProvider>(_ =>
            {
                var region = RegionEndpoint.GetBySystemName(
                    configuration["Cognito:Region"]);

                return new AmazonCognitoIdentityProviderClient(
                    new AnonymousAWSCredentials(),
                    region);
            });

            return services;
        }
    }
}