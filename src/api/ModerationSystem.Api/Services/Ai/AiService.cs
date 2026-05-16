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
            _modelId = _configuration["Bedrock:ModelId"] ?? "eu.meta.llama3-2-1b-instruct-v1:0";
            
            var region = RegionEndpoint.GetBySystemName(_configuration["Bedrock:Region"] ?? "eu-central-1");
            
            _bedrockClient = new AmazonBedrockRuntimeClient(region);
        }

        public async Task<PostStatus> ModerateContentAsync(string content)
        {
            try
            {
                // Llama 3 Instruct prompt format
                var instruction = "Analyze the following social media post for inappropriate content (hate speech, harassment, explicit content, etc.). Answer with ONLY one word: 'flagged' if it is inappropriate, or 'published' if it is safe.";
                var prompt = $"<|begin_of_text|><|start_header_id|>system<|end_header_id|>\n\n{instruction}<|eot_id|><|start_header_id|>user<|end_header_id|>\n\nPost content: \"{content}\"<|eot_id|><|start_header_id|>assistant<|end_header_id|>\n\n";

                var requestBody = new
                {
                    prompt = prompt,
                    max_gen_len = 10,
                    temperature = 0.1
                };

                var request = new InvokeModelRequest
                {
                    ModelId = _modelId,
                    ContentType = "application/json",
                    Accept = "application/json",
                    Body = new MemoryStream(Encoding.UTF8.GetBytes(JsonSerializer.Serialize(requestBody)))
                };

                var response = await _bedrockClient.InvokeModelAsync(request);
                
                using var reader = new StreamReader(response.Body);
                var responseBody = await reader.ReadToEndAsync();
                var jsonDoc = JsonDocument.Parse(responseBody);
                
                // Extracting content from Llama response structure: generation
                var result = jsonDoc.RootElement
                    .GetProperty("generation")
                    .GetString()?.Trim().ToLower();

                if (result != null && result.Contains("flagged"))
                {
                    return PostStatus.Flagged;
                }

                return PostStatus.Published;
            }
            catch (Exception ex)
            {
                Console.WriteLine($">>> [AiService] Error during moderation: {ex.Message}");
                return PostStatus.Error;
            }
        }
    }
}
