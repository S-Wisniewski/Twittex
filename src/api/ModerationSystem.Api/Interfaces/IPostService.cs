using ModerationSystem.Api.Models.Dto.PostDtos;
using ModerationSystem.Api.Models.Enums;

namespace ModerationSystem.Api.Interfaces
{
    public interface IPostService
    {
        Task<PostDto?> GetPostByIdAsync(int id);
        Task<IEnumerable<PostDto>> GetAllPostsAsync();
        Task<IEnumerable<PostDto>> GetPostsByStatusAsync(PostStatus status);
        Task<PostDto> CreatePostAsync(CreatePostDto dto);
        Task<bool> UpdatePostAsync(int id, UpdatePostDto dto);
        Task<bool> DeletePostAsync(int id);
        Task<bool> ChangePostStatusAsync(int id, PostStatus newStatus);
    }
}
