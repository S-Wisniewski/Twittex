using ModerationSystem.Api.Models.Dto.UserDtos;

namespace ModerationSystem.Api.Services.Users
{
    public interface IUserService
    {
        Task<IEnumerable<UserResponse>> GetAllUsersAsync(string? currentUserId = null);
        Task<UserResponse?> GetUserAsync(string userId, string? currentUserId = null);
        Task<IEnumerable<UserResponse>> SearchUsersAsync(string query, string? currentUserId = null);
        Task<UserResponse?> UpdateUserAsync(string userId, UpdateUserRequest request);
        Task<IEnumerable<UserResponse>> GetFollowersAsync(string userId, string? currentUserId = null);
        Task<IEnumerable<UserResponse>> GetFollowingAsync(string userId, string? currentUserId = null);
        Task<bool> FollowUserAsync(string userId, string currentUserId);
        Task<bool> UnfollowUserAsync(string userId, string currentUserId);
        Task<bool> DeleteUserAsync(string userId);
    }
}
