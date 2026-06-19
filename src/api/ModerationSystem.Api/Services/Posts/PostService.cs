using AutoMapper;
using Microsoft.EntityFrameworkCore;
using ModerationSystem.Api.Data;
using ModerationSystem.Api.Models.Dto.PostDtos;
using ModerationSystem.Api.Models.Entities;
using ModerationSystem.Api.Services.Audit;
using ModerationSystem.Api.Services.Notifications;
using ModerationSystem.Api.Services.Ai;
using ModerationSystem.Api.Models.Enums;

namespace ModerationSystem.Api.Services.Posts
{
    public class PostService : IPostService
    {
        private readonly AppDbContext _context;
        private readonly IMapper _mapper;
        private readonly IAuditService _auditService;
        private readonly INotificationService _notificationsService;
        private readonly IAiService _aiService;

        public PostService(
            AppDbContext context,
            IMapper mapper,
            IAuditService auditService,
            INotificationService notificationsService,
            IAiService aiService)
        {
            _context = context;
            _mapper = mapper;
            _auditService = auditService;
            _notificationsService = notificationsService;
            _aiService = aiService;
        }

        public async Task<IEnumerable<PostResponse>> GetFeedAsync(int pageNumber = 1, int pageSize = 10, string? currentUserId = null)
        {
            var posts = await _context.Posts
                .Include(p => p.User)
                .Include(p => p.Likes)
                .Include(p => p.Replies)
                .Where(p => p.ParentPostId == null)
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
                .Where(p => p.CognitoUserId == userId && p.ParentPostId == null)
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
            _auditService.AddLog(
               userId,
               $"Post created: {request.Content.Substring(0, Math.Min(50, request.Content.Length))}..."
           );

            await _context.SaveChangesAsync();
            await _notificationsService.NotifyModeratorsOfPendingPost(post);

            await _context.Entry(post).Reference(p => p.User).LoadAsync();
            await _context.Entry(post).Collection(p => p.Likes).LoadAsync();
            await _context.Entry(post).Collection(p => p.Replies).LoadAsync();

            var aiReason = post.Status switch
            {
                PostStatus.Published => "Automated review passed. Your post is now live.",
                PostStatus.Flagged   => "Your post was flagged by automated content moderation and is pending manual review.",
                PostStatus.Rejected  => "Your post was rejected by automated content moderation for policy violations.",
                _                    => "Your post was submitted and is awaiting review."
            };
            await _notificationsService.NotifyUserOfPostStatusChange(post, oldStatus: null, reason: aiReason, triggeredBy: "llm");

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

        public async Task<IEnumerable<ReplyThreadResponse>> GetUserRepliesAsync(string userId, string? currentUserId = null)
        {
            var replies = await _context.Posts
                .Include(p => p.User)
                .Include(p => p.Likes)
                .Include(p => p.Replies)
                .Include(p => p.ParentPost).ThenInclude(pp => pp!.User)
                .Include(p => p.ParentPost).ThenInclude(pp => pp!.Likes)
                .Include(p => p.ParentPost).ThenInclude(pp => pp!.Replies)
                .Include(p => p.ParentPost).ThenInclude(pp => pp!.ParentPost).ThenInclude(ppp => ppp!.User)
                .Include(p => p.ParentPost).ThenInclude(pp => pp!.ParentPost).ThenInclude(ppp => ppp!.Likes)
                .Include(p => p.ParentPost).ThenInclude(pp => pp!.ParentPost).ThenInclude(ppp => ppp!.Replies)
                .Where(p => p.CognitoUserId == userId && p.ParentPostId != null)
                .OrderByDescending(p => p.CreatedAt)
                .ToListAsync();

            return replies.Select(reply =>
            {
                var ancestors = new List<PostResponse>();
                var node = reply.ParentPost;
                while (node != null)
                {
                    ancestors.Insert(0, MapToPostResponse(node, currentUserId));
                    node = node.ParentPost;
                }
                return new ReplyThreadResponse
                {
                    Ancestors = ancestors,
                    Reply = MapToPostResponse(reply, currentUserId),
                };
            });
        }

        public async Task<IEnumerable<PostResponse>> GetCommentsAsync(int postId, string? currentUserId = null)
        {
            var posts = await _context.Posts
                .Include(p => p.User)
                .Include(p => p.Likes)
                .Include(p => p.Replies)
                .Where(p => p.ParentPostId == postId)
                .OrderBy(p => p.CreatedAt)
                .ToListAsync();

            return posts.Select(p => MapToPostResponse(p, currentUserId));
        }

        public async Task<IEnumerable<PostResponse>> GetAncestorsAsync(int postId, string? currentUserId = null)
        {
            var ancestors = new List<Post>();

            var seed = await _context.Posts.AsNoTracking().FirstOrDefaultAsync(p => p.Id == postId);
            if (seed == null || !seed.ParentPostId.HasValue) return [];

            var nodeId = seed.ParentPostId;
            while (nodeId.HasValue)
            {
                var node = await _context.Posts
                    .Include(p => p.User)
                    .Include(p => p.Likes)
                    .Include(p => p.Replies)
                    .FirstOrDefaultAsync(p => p.Id == nodeId.Value);
                if (node == null) break;
                ancestors.Insert(0, node);
                nodeId = node.ParentPostId;
            }

            return ancestors.Select(p => MapToPostResponse(p, currentUserId));
        }

        public async Task<IEnumerable<PostResponse>> GetActiveStatusPostsAsync(string userId)
        {
            var posts = await _context.Posts
                .Include(p => p.User)
                .Include(p => p.Likes)
                .Include(p => p.Replies)
                .Where(p => p.CognitoUserId == userId && p.Status != PostStatus.Published)
                .OrderByDescending(p => p.CreatedAt)
                .ToListAsync();

            return posts.Select(p => MapToPostResponse(p, userId));
        }

        private PostResponse MapToPostResponse(Post post, string? currentUserId)
        {
            var response = _mapper.Map<PostResponse>(post);
            response.IsLiked = currentUserId != null && post.Likes.Any(l => l.CognitoUserId == currentUserId);
            return response;
        }
    }
}
