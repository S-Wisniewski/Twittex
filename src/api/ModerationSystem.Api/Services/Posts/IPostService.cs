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
        Task<IEnumerable<PostResponse>> GetCommentsAsync(int postId, string? currentUserId = null);
        Task<IEnumerable<ReplyThreadResponse>> GetUserRepliesAsync(string userId, string? currentUserId = null);
        Task<IEnumerable<PostResponse>> GetAncestorsAsync(int postId, string? currentUserId = null);
        Task<IEnumerable<PostResponse>> GetActiveStatusPostsAsync(string userId);
    }
}
