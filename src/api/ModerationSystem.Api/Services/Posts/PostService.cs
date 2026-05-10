using AutoMapper;
using Microsoft.EntityFrameworkCore;
using ModerationSystem.Api.Data;
using ModerationSystem.Api.Models.Dto.PostDtos;
using ModerationSystem.Api.Models.Entities;
using ModerationSystem.Api.Models.Enums;
using ModerationSystem.Api.Services.Ai;

namespace ModerationSystem.Api.Services.Posts
{
    public class PostService : IPostService
    {
        private readonly AppDbContext _context;
        private readonly IMapper _mapper;
        private readonly IAiService _aiService;

        public PostService(AppDbContext context, IMapper mapper, IAiService aiService)
        {
            _context = context;
            _mapper = mapper;
            _aiService = aiService;
        }

        public async Task<IEnumerable<PostResponse>> GetFeedAsync(int pageNumber = 1, int pageSize = 10, string? currentUserId = null)
        {
            var posts = await _context.Posts
                .Include(p => p.User)
                .Include(p => p.Likes)
                .Include(p => p.Replies)
                .OrderByDescending(p => p.CreatedAt)
                .Skip((pageNumber - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();

            return posts.Select(p => MapToPostResponse(p, currentUserId));
        }

        public async Task<PostResponse?> GetByIdAsync(int postId, string? currentUserId = null)
        {
            var post = await _context.Posts
                .Include(p => p.User)
                .Include(p => p.Likes)
                .Include(p => p.Replies)
                .FirstOrDefaultAsync(p => p.Id == postId);

            if (post == null) return null;
            return MapToPostResponse(post, currentUserId);
        }

        public async Task<IEnumerable<PostResponse>> GetUsersPostsAsync(string userId, string? currentUserId = null)
        {
            var posts = await _context.Posts
                .Include(p => p.User)
                .Include(p => p.Likes)
                .Include(p => p.Replies)
                .Where(p => p.CognitoUserId == userId)
                .OrderByDescending(p => p.CreatedAt)
                .ToListAsync();

            return posts.Select(p => MapToPostResponse(p, currentUserId));
        }

        public async Task<PostResponse> CreatePostAsync(CreatePostRequest request, string userId)
        {
            // Handle ParentPostId being 0 (which some frontends might send instead of null)
            int? parentPostId = request.ParentPostId == 0 ? null : request.ParentPostId;

            // Moderate content using AI
            var status = await _aiService.ModerateContentAsync(request.Content);

            var post = new Post
            {
                CognitoUserId = userId,
                Content = request.Content,
                ParentPostId = parentPostId,
                Status = status
            };

            _context.Posts.Add(post);
            await _context.SaveChangesAsync();

            await _context.Entry(post).Reference(p => p.User).LoadAsync();
            await _context.Entry(post).Collection(p => p.Likes).LoadAsync();
            await _context.Entry(post).Collection(p => p.Replies).LoadAsync();

            return MapToPostResponse(post, userId);
        }

        public async Task<IEnumerable<PostLogResponse>> GetLogsAsync(int postId)
        {
            var logs = await _context.Set<Log>()
                .Where(l => l.PostId == postId)
                .OrderByDescending(l => l.CreatedAt)
                .ToListAsync();

            return _mapper.Map<IEnumerable<PostLogResponse>>(logs);
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

        private PostResponse MapToPostResponse(Post post, string? currentUserId)
        {
            var response = _mapper.Map<PostResponse>(post);
            response.IsLiked = currentUserId != null && post.Likes.Any(l => l.CognitoUserId == currentUserId);
            return response;
        }
    }
}
