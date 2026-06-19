using Amazon;
using Amazon.S3;
using Amazon.S3.Model;

namespace ModerationSystem.Api.Services.Storage
{
    public class StorageService : IStorageService
    {
        private readonly IAmazonS3 _s3;
        private readonly string _bucket;
        private readonly string _region;

        public StorageService(IConfiguration config)
        {
            _bucket = config["S3:BucketName"]!;
            _region = config["S3:Region"]!;

            var region = RegionEndpoint.GetBySystemName(_region);
            var accessKey = config["S3:AccessKey"];
            var secretKey = config["S3:SecretKey"];

            _s3 = !string.IsNullOrEmpty(accessKey) && !string.IsNullOrEmpty(secretKey)
                ? new AmazonS3Client(new Amazon.Runtime.BasicAWSCredentials(accessKey, secretKey), region)
                : new AmazonS3Client(region);
        }

        public Task<(string UploadUrl, string PublicUrl)> GenerateAvatarUploadUrlAsync(string userId)
        {
            var timestamp = DateTimeOffset.UtcNow.ToUnixTimeMilliseconds();
            var key = $"avatars/{userId}_{timestamp}.jpg";

            var request = new GetPreSignedUrlRequest
            {
                BucketName = _bucket,
                Key = key,
                Verb = HttpVerb.PUT,
                Expires = DateTime.UtcNow.AddMinutes(5),
                ContentType = "image/jpeg",
            };

            var uploadUrl = _s3.GetPreSignedURL(request);
            var publicUrl = $"https://{_bucket}.s3.{_region}.amazonaws.com/{key}";

            return Task.FromResult((uploadUrl, publicUrl));
        }
    }
}
