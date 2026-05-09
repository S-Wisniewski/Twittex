using Microsoft.EntityFrameworkCore;
using ModerationSystem.Api.Data;
using ModerationSystem.Api.Models.Dto.UserDtos;
using ModerationSystem.Api.Models.Entities;

namespace ModerationSystem.Api.Services.Users
{
    public class UserService : IUserService
    {
        private readonly AppDbContext _context;

        public UserService(AppDbContext context)
        {
            _context = context;
        }

        public async Task<UserResponse?> GetUserAsync(string userId, string? currentUserId = null)
        {
            var user = await _context.Users
                .Include(u => u.Followers)
                .Include(u => u.Following)
                .FirstOrDefaultAsync(u => u.CognitoUserId == userId);

            if (user == null) return null;

            return MapToResponse(user, currentUserId);
        }

        public async Task<IEnumerable<UserResponse>> SearchUsersAsync(string query, string? currentUserId = null)
        {
            var users = await _context.Users
                .Include(u => u.Followers)
                .Include(u => u.Following)
                .Where(u => u.UserName.Contains(query) || (u.DisplayName != null && u.DisplayName.Contains(query)))
                .ToListAsync();

            return users.Select(u => MapToResponse(u, currentUserId));
        }

        public async Task<UserResponse?> UpdateUserAsync(string userId, UpdateUserRequest request)
        {
            var user = await _context.Users
                .Include(u => u.Followers)
                .Include(u => u.Following)
                .FirstOrDefaultAsync(u => u.CognitoUserId == userId);

            if (user == null) return null;

            if (request.UserName != null) user.UserName = request.UserName;
            if (request.DisplayName != null) user.DisplayName = request.DisplayName;
            if (request.Bio != null) user.Bio = request.Bio;

            await _context.SaveChangesAsync();

            return MapToResponse(user, userId);
        }

        public async Task<bool> FollowUserAsync(string userId, string currentUserId)
        {
            if (userId == currentUserId) return false;

            var userToFollow = await _context.Users.FirstOrDefaultAsync(u => u.CognitoUserId == userId);
            var currentUser = await _context.Users.FirstOrDefaultAsync(u => u.CognitoUserId == currentUserId);

            if (userToFollow == null || currentUser == null) return false;

            var existingFollow = await _context.Set<UserFollows>()
                .FirstOrDefaultAsync(f => f.FollowerId == currentUserId && f.FollowedId == userId);

            if (existingFollow != null)
            {
                // Unfollow
                _context.Set<UserFollows>().Remove(existingFollow);
            }
            else
            {
                // Follow
                _context.Set<UserFollows>().Add(new UserFollows
                {
                    FollowerId = currentUserId,
                    FollowedId = userId
                });
            }

            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<bool> DeleteUserAsync(string userId)
        {
            var user = await _context.Users.FirstOrDefaultAsync(u => u.CognitoUserId == userId);
            if (user == null) return false;

            _context.Users.Remove(user);
            await _context.SaveChangesAsync();
            return true;
        }

        private UserResponse MapToResponse(User user, string? currentUserId)
        {
            return new UserResponse
            {
                Id = user.CognitoUserId,
                UserId = user.CognitoUserId,
                UserName = user.UserName,
                CreatedAt = user.CreatedAt,
                Content = user.Bio ?? string.Empty,
                UserAvatarUrl = user.AvatarUrl ?? string.Empty,
                IsLiked = false, // As per requirements, doesn't make much sense for user
                Followers = user.Followers.Count,
                Following = user.Following.Count,
                YouFollow = currentUserId != null && user.Followers.Any(f => f.FollowerId == currentUserId)
            };
        }
    }
}
