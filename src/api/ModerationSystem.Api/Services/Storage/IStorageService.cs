namespace ModerationSystem.Api.Services.Storage
{
    public interface IStorageService
    {
        Task<(string UploadUrl, string PublicUrl)> GenerateAvatarUploadUrlAsync(string userId);
    }
}
