using AutoMapper;
using AutoMapper.QueryableExtensions;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Protocols.OpenIdConnect;
using ModerationSystem.Api.Data;
using ModerationSystem.Api.Models.Dto.PostDtos;
using ModerationSystem.Api.Models.Entities;
using ModerationSystem.Api.Models.Enums;

namespace ModerationSystem.Api.Services.Posts
{
    public class PostService : IPostService
    {
        private readonly AppDbContext _context;
        private readonly IMapper _mapper;

        public PostService(AppDbContext context, IMapper mapper)
        {
            _context = context;
            _mapper = mapper;
        }

        public Task<bool> ChangePostStatusAsync(int id, PostStatus newStatus)
        {
            throw new NotImplementedException();
        }

        public async Task<PostDto> CreatePostAsync(CreatePostDto dto)
        {
            var post = _mapper.Map<Post>(dto);
            post.Status = PostStatus.Pending; // New posts start as pending

            var createdPost = _context.Posts.Add(post).Entity;
            return _mapper.Map<PostDto>(createdPost);
        }

        public async Task<bool> DeletePostAsync(int id)
        {
            var post = await _context.Posts.FirstOrDefaultAsync(p => p.Id == id);
            if (post == null) return false;

            _context.Posts.Remove(post);
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
            var post = _context.Posts.FirstOrDefault(p => p.Id == id);
            if (post == null) return false;

            post.Content = dto.Content;
            post.Status = PostStatus.Pending; // Reset status to pending for re-review

            _context.Posts.Update(post);
            await _context.SaveChangesAsync();
            return true;
        }
    }
}
