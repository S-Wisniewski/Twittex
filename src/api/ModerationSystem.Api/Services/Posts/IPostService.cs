using ModerationSystem.Api.Models.Dto.PostDtos;

namespace ModerationSystem.Api.Services.Posts
{
    public interface IPostService
    {
        Task<IEnumerable<PostResponse>> GetFeedAsync(int pageNumber = 1, int pageSize = 10, string? currentUserId = null);
        Task<PostResponse?> GetByIdAsync(int postId, string? currentUserId = null);
        Task<IEnumerable<PostResponse>> GetUsersPostsAsync(string userId, string? currentUserId = null);
        Task<PostResponse> CreatePostAsync(CreatePostRequest request, string userId);
        Task<IEnumerable<PostLogResponse>> GetLogsAsync(int postId);
        Task<bool> LikePostAsync(int postId, string userId);
        Task<bool> UnlikePostAsync(int postId, string userId);
        Task<ReviewResponse> PostReviewAsync(int postId, string userId, PostReviewRequest request);
        Task<IEnumerable<ReviewResponse>> GetReviewsAsync(int postId);
    }
}
