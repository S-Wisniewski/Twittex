using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using ModerationSystem.Api.Models.Dto.PostDtos;
using ModerationSystem.Api.Services.Posts;

namespace ModerationSystem.Api.Controllers
{
    [ApiController]
    [Route("api/posts")]
    [Authorize]
    public class PostsController : ControllerBase
    {
        private readonly IPostService _postService;

        public PostsController(IPostService postService)
        {
            _postService = postService;
        }

        private string? GetCurrentUserId() => User.FindFirst("sub")?.Value;

        [HttpGet]
        [AllowAnonymous]
        public async Task<IActionResult> GetFeed([FromQuery] int page = 1, [FromQuery] int pageSize = 10)
        {
            string? currentUserId = GetCurrentUserId();
            var posts = await _postService.GetFeedAsync(page, pageSize, currentUserId);
            return Ok(posts);
        }

        [HttpGet("{postId}")]
        [AllowAnonymous]
        public async Task<IActionResult> GetById(int postId)
        {
            string? currentUserId = GetCurrentUserId();
            var post = await _postService.GetByIdAsync(postId, currentUserId);
            if (post == null) return NotFound();

            return Ok(post);
        }

        [HttpGet("~/api/users/{userId}/posts")]
        [AllowAnonymous]
        public async Task<IActionResult> GetUsersPosts(string userId)
        {
            string? currentUserId = GetCurrentUserId();
            var posts = await _postService.GetUsersPostsAsync(userId, currentUserId);
            return Ok(posts);
        }

        [HttpGet("~/api/users/{userId}/replies")]
        [AllowAnonymous]
        public async Task<IActionResult> GetUserReplies(string userId)
        {
            string? currentUserId = GetCurrentUserId();
            var threads = await _postService.GetUserRepliesAsync(userId, currentUserId);
            return Ok(threads);
        }

        [HttpPost]
        public async Task<IActionResult> CreatePost([FromBody] CreatePostRequest request)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);

            string? currentUserId = GetCurrentUserId();
            if (currentUserId == null) return Unauthorized();

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
            string? currentUserId = GetCurrentUserId();
            if (currentUserId == null) return Unauthorized();

            var success = await _postService.LikePostAsync(id, currentUserId);
            if (!success) return NotFound();

            return Ok();
        }

        [HttpGet("{postId}/ancestors")]
        [AllowAnonymous]
        public async Task<IActionResult> GetAncestors(int postId)
        {
            string? currentUserId = GetCurrentUserId();
            var ancestors = await _postService.GetAncestorsAsync(postId, currentUserId);
            return Ok(ancestors);
        }

        [HttpGet("~/api/users/me/post-statuses")]
        public async Task<IActionResult> GetMyPostStatuses()
        {
            string? currentUserId = GetCurrentUserId();
            if (currentUserId == null) return Unauthorized();
            var posts = await _postService.GetActiveStatusPostsAsync(currentUserId);
            return Ok(posts);
        }

        [HttpGet("{postId}/comments")]
        [AllowAnonymous]
        public async Task<IActionResult> GetComments(int postId)
        {
            string? currentUserId = GetCurrentUserId();
            var comments = await _postService.GetCommentsAsync(postId, currentUserId);
            return Ok(comments);
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeletePost(int id)
        {
            string? currentUserId = GetCurrentUserId();
            if (currentUserId == null) return Unauthorized();

            var success = await _postService.DeletePostAsync(id, currentUserId);
            if (!success) return NotFound();

            return NoContent();
        }

        [HttpDelete("{id}/likes")]
        public async Task<IActionResult> UnlikePost(int id)
        {
            string? currentUserId = GetCurrentUserId();
            if (currentUserId == null) return Unauthorized();

            var success = await _postService.UnlikePostAsync(id, currentUserId);
            if (!success) return NotFound();

            return NoContent();
        }

        [HttpPost("{id}/bookmarks")]
        public async Task<IActionResult> BookmarkPost(int id)
        {
            string? currentUserId = GetCurrentUserId();
            if (currentUserId == null) return Unauthorized();

            var success = await _postService.BookmarkPostAsync(id, currentUserId);
            if (!success) return NotFound();

            return Ok();
        }

        [HttpDelete("{id}/bookmarks")]
        public async Task<IActionResult> UnbookmarkPost(int id)
        {
            string? currentUserId = GetCurrentUserId();
            if (currentUserId == null) return Unauthorized();

            var success = await _postService.UnbookmarkPostAsync(id, currentUserId);
            if (!success) return NotFound();

            return NoContent();
        }

        [HttpGet("~/api/users/me/bookmarks")]
        public async Task<IActionResult> GetMyBookmarks([FromQuery] int page = 1, [FromQuery] int pageSize = 15)
        {
            string? currentUserId = GetCurrentUserId();
            if (currentUserId == null) return Unauthorized();

            var bookmarks = await _postService.GetBookmarksAsync(currentUserId, page, pageSize);
            return Ok(bookmarks);
        }
    }
}
