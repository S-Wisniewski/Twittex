using Microsoft.EntityFrameworkCore;
using ModerationSystem.Api.Data;
using ModerationSystem.Api.Models.Entities;
using ModerationSystem.Api.Models.Enums;

namespace ModerationSystem.Api
{
    public class PostRepository
    {
        private readonly AppDbContext _context;

        public PostRepository(AppDbContext context)
        {
            _context = context;
        }

        public async Task<Post?> GetByIdAsync(int id)
        {
            // .Include(p => p.User)
            return await _context.Posts.FirstOrDefaultAsync(p => p.Id == id);
        }

        public async Task<IEnumerable<Post>> GetAllAsync()
        {
            return await _context.Posts.ToListAsync();
        }

        public async Task<IEnumerable<Post>> GetByStatusAsync(PostStatus status)
        {
            return await _context.Posts.Where(p => p.Status == status).ToListAsync();
        }

        public async Task<Post> AddAsync(Post post)
        {
            await _context.Posts.AddAsync(post);
            await _context.SaveChangesAsync();
            return post;
        }

        public async Task UpdateAsync(Post post)
        {
            _context.Posts.Update(post);
            await _context.SaveChangesAsync();
        }

        public async Task DeleteAsync(Post post)
        {
            _context.Posts.Remove(post);
            await _context.SaveChangesAsync();
        }
    }
}
