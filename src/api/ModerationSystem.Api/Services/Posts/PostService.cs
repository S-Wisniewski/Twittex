using AutoMapper;
using Microsoft.EntityFrameworkCore;
using ModerationSystem.Api.Data;
using ModerationSystem.Api.Models.Dto.PostDtos;
using ModerationSystem.Api.Models.Entities;
using ModerationSystem.Api.Models.Enums;
using ModerationSystem.Api.Services.Audit;
using ModerationSystem.Api.Services.Notifications;

namespace ModerationSystem.Api.Services.Posts
{
    public class PostService : IPostService
    {
        private readonly AppDbContext _context;
        private readonly IMapper _mapper;
        private readonly IAuditService _auditService;
        private readonly NotificationService _notifications;

        public PostService(
            AppDbContext context,
            IMapper mapper,
            IAuditService auditService,
            NotificationService notifications)
        {
            _context = context;
            _mapper = mapper;
            _auditService = auditService;
            _notifications = notifications;
        }

        public async Task<bool> ChangePostStatusAsync(int id, PostStatus newStatus)
        {
            throw new NotImplementedException();
        }

        public async Task<PostDto> CreatePostAsync(CreatePostDto dto)
        {
            var post = _mapper.Map<Post>(dto);
            post.Status = PostStatus.Pending;

            _context.Posts.Add(post);

            _auditService.AddLog(post.CognitoUserId, $"Post created: {post.Content}");

            await _context.SaveChangesAsync();

            await _notifications.NotifyModeratorsOfPendingPost(post);

            return _mapper.Map<PostDto>(post);
        }

        public async Task<bool> DeletePostAsync(int id)
        {
            var post = await _context.Posts.FirstOrDefaultAsync(p => p.Id == id);
            if (post == null || post.DeletedAt != null) return false;

            post.DeletedAt = DateTime.UtcNow;

            _auditService.AddLog(post.CognitoUserId, $"Post deleted: {post.Content}");

            await _context.SaveChangesAsync();

            return true;
        }

        public async Task<IEnumerable<PostDto>> GetAllPostsAsync()
        {
            var posts = await _context.Posts.ToListAsync();

            return _mapper.Map<IEnumerable<PostDto>>(posts);
        }

        public async Task<PostDto?> GetPostByIdAsync(int id)
        {
            var post = await _context.Posts.FirstOrDefaultAsync(p => p.Id == id);
            return _mapper.Map<PostDto?>(post);
        }

        public Task<IEnumerable<PostDto>> GetPostsByStatusAsync(PostStatus status)
        {
            throw new NotImplementedException();
        }

        public async Task<bool> UpdatePostAsync(int id, UpdatePostDto dto)
        {
            var post = await _context.Posts.FirstOrDefaultAsync(p => p.Id == id);
            if (post == null) return false;

            post.Content = dto.Content;
            post.Status = PostStatus.Pending;
            post.UpdatedAt = DateTime.UtcNow;

            _auditService.AddLog(post.CognitoUserId, $"Post updated: {post.Content}");

            await _context.SaveChangesAsync();

            await _notifications.NotifyModeratorsOfPendingPost(post);

            return true;
        }
    }
}
