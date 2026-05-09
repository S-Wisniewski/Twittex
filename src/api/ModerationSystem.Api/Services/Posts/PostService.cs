using Microsoft.EntityFrameworkCore;
using ModerationSystem.Api.Data;
using ModerationSystem.Api.Models.Dto.PostDtos;
using ModerationSystem.Api.Models.Entities;
using ModerationSystem.Api.Models.Enums;

namespace ModerationSystem.Api.Services.Posts
{
    public class PostService : IPostService
    {
        private readonly AppDbContext _context;

        public PostService(AppDbContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<PostResponse>> GetFeedAsync(string? currentUserId = null)
        {
            var posts = await _context.Posts
                .Include(p => p.User)
                .Include(p => p.Likes)
                .Include(p => p.Reviews)
                .OrderByDescending(p => p.CreatedAt)
                .ToListAsync();

            return posts.Select(p => MapToPostResponse(p, currentUserId));
        }

        public async Task<PostResponse?> GetByIdAsync(int postId, string? currentUserId = null)
        {
            var post = await _context.Posts
                .Include(p => p.User)
                .Include(p => p.Likes)
                .Include(p => p.Reviews)
                .FirstOrDefaultAsync(p => p.Id == postId);

            if (post == null) return null;
            return MapToPostResponse(post, currentUserId);
        }

        public async Task<IEnumerable<PostResponse>> GetUsersPostsAsync(string userId, string? currentUserId = null)
        {
            var posts = await _context.Posts
                .Include(p => p.User)
                .Include(p => p.Likes)
                .Include(p => p.Reviews)
                .Where(p => p.CognitoUserId == userId)
                .OrderByDescending(p => p.CreatedAt)
                .ToListAsync();

            return posts.Select(p => MapToPostResponse(p, currentUserId));
        }

        public async Task<PostResponse> CreatePostAsync(CreatePostRequest request, string userId)
        {
            // Handle ParentPostId being 0 (which some frontends might send instead of null)
            int? parentPostId = request.ParentPostId == 0 ? null : request.ParentPostId;

            // Ensure the user exists in our database
            var user = await _context.Users.FirstOrDefaultAsync(u => u.CognitoUserId == userId);
            if (user == null)
            {
                // For development: auto-create mock user if it doesn't exist
                user = new User
                {
                    CognitoUserId = userId,
                    UserName = userId == "mocked-current-user-id" ? "TestUser" : userId,
                    DisplayName = userId == "mocked-current-user-id" ? "Test User" : userId,
                    Bio = "I am a test user.",
                    CreatedAt = DateTime.UtcNow
                };
                _context.Users.Add(user);
                await _context.SaveChangesAsync();
            }

            var post = new Post
            {
                CognitoUserId = userId,
                Content = request.Content,
                ParentPostId = parentPostId,
                Status = PostStatus.Pending
            };

            _context.Posts.Add(post);
            await _context.SaveChangesAsync();

            await _context.Entry(post).Reference(p => p.User).LoadAsync();
            await _context.Entry(post).Collection(p => p.Likes).LoadAsync();

            return MapToPostResponse(post, userId);
        }

        public async Task<IEnumerable<PostLogResponse>> GetLogsAsync(int postId)
        {
            var logs = await _context.Set<Log>()
                .Where(l => l.PostId == postId)
                .OrderByDescending(l => l.CreatedAt)
                .ToListAsync();

            return logs.Select(l => new PostLogResponse
            {
                Id = l.Id.ToString(),
                OldStatus = l.OldStatus,
                NewStatus = l.NewStatus,
                Reason = l.Reason,
                TriggeredBy = l.TriggeredBy,
                CreatedAt = l.CreatedAt
            });
        }

        public async Task<bool> LikePostAsync(int postId, string userId)
        {
            var post = await _context.Posts.FirstOrDefaultAsync(p => p.Id == postId);
            if (post == null) return false;

            var existingLike = await _context.Set<PostLikes>()
                .FirstOrDefaultAsync(l => l.PostId == postId && l.CognitoUserId == userId);

            if (existingLike == null)
            {
                _context.Set<PostLikes>().Add(new PostLikes
                {
                    PostId = postId,
                    CognitoUserId = userId
                });
                await _context.SaveChangesAsync();
            }

            return true;
        }

        public async Task<bool> UnlikePostAsync(int postId, string userId)
        {
            var existingLike = await _context.Set<PostLikes>()
                .FirstOrDefaultAsync(l => l.PostId == postId && l.CognitoUserId == userId);

            if (existingLike != null)
            {
                _context.Set<PostLikes>().Remove(existingLike);
                await _context.SaveChangesAsync();
            }

            return true;
        }

        public async Task<ReviewResponse> PostReviewAsync(int postId, string userId, PostReviewRequest request)
        {
            var review = new Review
            {
                PostId = postId,
                CognitoUserId = userId,
                ReviewType = request.ReviewType,
                Description = request.Description
            };

            _context.Set<Review>().Add(review);
            await _context.SaveChangesAsync();

            return new ReviewResponse
            {
                Id = review.Id.ToString(),
                PostId = review.PostId,
                CognitoUserId = review.CognitoUserId,
                Description = review.Description,
                ReviewType = review.ReviewType,
                CreatedAt = review.CreatedAt
            };
        }

        public async Task<IEnumerable<ReviewResponse>> GetReviewsAsync(int postId)
        {
            var reviews = await _context.Set<Review>()
                .Where(r => r.PostId == postId)
                .ToListAsync();

            return reviews.Select(r => new ReviewResponse
            {
                Id = r.Id.ToString(),
                PostId = r.PostId,
                CognitoUserId = r.CognitoUserId,
                Description = r.Description,
                ReviewType = r.ReviewType,
                CreatedAt = r.CreatedAt
            });
        }

        private PostResponse MapToPostResponse(Post post, string? currentUserId)
        {
            return new PostResponse
            {
                Id = post.Id.ToString(),
                UserName = post.User?.UserName ?? string.Empty,
                UserId = post.CognitoUserId,
                CreatedAt = post.CreatedAt,
                Content = post.Content,
                UserAvatarUrl = post.User?.AvatarUrl ?? string.Empty,
                IsLiked = currentUserId != null && post.Likes.Any(l => l.CognitoUserId == currentUserId),
                Status = post.Status,
                ParentPostId = post.ParentPostId,
                LikeCount = post.Likes.Count,
                CommentCount = 0 // Needs proper implementation with replies/comments if applicable
            };
        }
    }
}
