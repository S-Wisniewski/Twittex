using Microsoft.AspNetCore.Mvc;
using ModerationSystem.Api.Models.Dto.PostDtos;
using ModerationSystem.Api.Services.Posts;

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
        public async Task<IActionResult> GetFeed()
        {
            // Mocking current user since auth is not implemented yet
            string? currentUserId = "mocked-current-user-id";
            var posts = await _postService.GetFeedAsync(currentUserId);
            return Ok(posts);
        }

        [HttpGet("{postId}")]
        public async Task<IActionResult> GetById(int postId)
        {
            string? currentUserId = "mocked-current-user-id";
            var post = await _postService.GetByIdAsync(postId, currentUserId);
            if (post == null) return NotFound();

            return Ok(post);
        }

        [HttpGet("~/api/users/{userId}/posts")]
        public async Task<IActionResult> GetUsersPosts(string userId)
        {
            string? currentUserId = "mocked-current-user-id";
            var posts = await _postService.GetUsersPostsAsync(userId, currentUserId);
            return Ok(posts);
        }

        [HttpPost]
        public async Task<IActionResult> CreatePost([FromBody] CreatePostRequest request)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);

            string currentUserId = "mocked-current-user-id"; // From auth context
            var createdPost = await _postService.CreatePostAsync(request, currentUserId);
            return CreatedAtAction(nameof(GetById), new { postId = int.Parse(createdPost.Id) }, createdPost);
        }

        [HttpGet("{id}/logs")]
        public async Task<IActionResult> GetLogs(int id)
        {
            var logs = await _postService.GetLogsAsync(id);
            return Ok(logs);
        }

        [HttpPost("{id}/likes")]
        public async Task<IActionResult> LikePost(int id)
        {
            string currentUserId = "mocked-current-user-id";
            var success = await _postService.LikePostAsync(id, currentUserId);
            if (!success) return NotFound();

            return Ok();
        }

        [HttpDelete("{id}/likes")]
        public async Task<IActionResult> UnlikePost(int id) // Named unlikePost as it makes more sense for DELETE
        {
            string currentUserId = "mocked-current-user-id";
            var success = await _postService.UnlikePostAsync(id, currentUserId);
            if (!success) return NotFound();

            return NoContent();
        }

        [HttpPost("{id}/reviews")]
        public async Task<IActionResult> PostReview(int id, [FromBody] PostReviewRequest request)
        {
            string currentUserId = "mocked-current-user-id";
            var review = await _postService.PostReviewAsync(id, currentUserId, request);
            return CreatedAtAction(nameof(GetReviews), new { id = id }, review);
        }

        [HttpGet("{id}/reviews")]
        public async Task<IActionResult> GetReviews(int id)
        {
            var reviews = await _postService.GetReviewsAsync(id);
            return Ok(reviews);
        }
    }
}
