using Microsoft.AspNetCore.Mvc;
using ModerationSystem.Api.Interfaces;
using ModerationSystem.Api.Models.Dto.PostDtos;

namespace ModerationSystem.Api.Controllers
{
    [ApiController]
    [Route("api/posts")]
    public class PostsController : ControllerBase
    {
        private readonly IPostService _postService;

        public PostsController(IPostService postService)
        {
            _postService = postService;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var posts = await _postService.GetAllPostsAsync();
            return Ok(posts);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            var post = await _postService.GetPostByIdAsync(id);
            if (post == null) return NotFound(new { Message = "Post not found." });

            return Ok(post);
        }

        //[HttpGet("status/{status}")]
        //public async Task<IActionResult> GetByStatus(PostStatus status)
        //{
        //    var posts = await _postService.GetPostsByStatusAsync(status);
        //    return Ok(posts);
        //}

        [HttpPost]
        public async Task<IActionResult> Create([FromBody] CreatePostDto dto)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);

            var createdPost = await _postService.CreatePostAsync(dto);
            return CreatedAtAction(nameof(GetById), new { id = createdPost.Id }, createdPost);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, [FromBody] UpdatePostDto dto)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);

            var success = await _postService.UpdatePostAsync(id, dto);
            if (!success) return NotFound(new { Message = "Post not found." });

            return NoContent();
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var success = await _postService.DeletePostAsync(id);
            if (!success) return NotFound(new { Message = "Post not found." });

            return NoContent();
        }

        //[HttpPatch("{id}/status")]
        //public async Task<IActionResult> ChangeStatus(int id, [FromBody] PostStatus newStatus)
        //{
        //    var success = await _postService.ChangePostStatusAsync(id, newStatus);
        //    if (!success) return NotFound(new { Message = "Post not found." });

        //    return NoContent();
        //}
    }
}
