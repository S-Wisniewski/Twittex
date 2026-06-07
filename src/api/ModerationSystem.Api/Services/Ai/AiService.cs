using Amazon;
using Amazon.BedrockRuntime;
using Amazon.BedrockRuntime.Model;
using ModerationSystem.Api.Models.Enums;
using System.Text;
using System.Text.Json;

namespace ModerationSystem.Api.Services.Ai
{
    public class AiService : IAiService
    {
        private readonly IAmazonBedrockRuntime _bedrockClient;
        private readonly IConfiguration _configuration;
        private readonly string _modelId;

        public AiService(IConfiguration configuration)
        {
            _configuration = configuration;
            _modelId = _configuration["Bedrock:ModelId"] ?? "eu.anthropic.claude-opus-4-6-v1";
            
            var region = Amazon.RegionEndpoint.GetBySystemName(_configuration["Bedrock:Region"] ?? "eu-central-1");
            
            var accessKey = _configuration["Bedrock:AccessKey"];
            var secretKey = _configuration["Bedrock:SecretKey"];

            if (!string.IsNullOrEmpty(accessKey) && !string.IsNullOrEmpty(secretKey))
            {
                var credentials = new Amazon.Runtime.BasicAWSCredentials(accessKey, secretKey);
                _bedrockClient = new AmazonBedrockRuntimeClient(credentials, region);
            }
            else
            {
                _bedrockClient = new AmazonBedrockRuntimeClient(region);
            }
        }

        public async Task<PostStatus> ModerateContentAsync(string content)
        {
            try
            {
                var payload = new
                {
                    anthropic_version = "bedrock-2023-05-31",
                    max_tokens = 50,
                    messages = new[]
                    {
                        new { role = "user", content = $"Evaluate the following content and determine if it violates community guidelines. Respond with EXACTLY ONE WORD: 'Flagged' if it violates guidelines (e.g. hate speech, explicit content, harassment), or 'Published' if it is safe.\n\nContent:\n{content}" }
                    }
                };

                string payloadJson = JsonSerializer.Serialize(payload);
                using var stream = new MemoryStream(Encoding.UTF8.GetBytes(payloadJson));

                var request = new InvokeModelRequest
                {
                    ModelId = _modelId,
                    ContentType = "application/json",
                    Accept = "application/json",
                    Body = stream
                };

                var response = await _bedrockClient.InvokeModelAsync(request);
                using var reader = new StreamReader(response.Body);
                var responseBody = await reader.ReadToEndAsync();

                using var document = JsonDocument.Parse(responseBody);
                var text = document.RootElement.GetProperty("content")[0].GetProperty("text").GetString()?.Trim() ?? "";

                if (text.Contains("Flagged", StringComparison.OrdinalIgnoreCase))
                {
                    Console.WriteLine("\n>>> [AiService] Model evaluated content as Flagged.\n");
                    return PostStatus.Flagged;
                }

                return PostStatus.Published;
            }
            catch (Exception ex)
            {
                Console.WriteLine($"\n>>> [AiService] Error during moderation: {ex.Message}\n");
                return PostStatus.Error;
            }
        }
    }
}
