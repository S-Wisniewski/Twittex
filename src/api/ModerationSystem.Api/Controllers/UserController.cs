using Microsoft.AspNetCore.Mvc;
using ModerationSystem.Api.Models.Dto.UserDtos;
using ModerationSystem.Api.Services.Users;

namespace ModerationSystem.Api.Controllers
{
    [ApiController]
    [Route("api/users")] // Using 'api/users' to match conventional routing, requirements said '/users'
    public class UserController : ControllerBase
    {
        private readonly IUserService _userService;

        public UserController(IUserService userService)
        {
            _userService = userService;
        }

        [HttpGet("{userId}")]
        public async Task<IActionResult> GetUser(string userId)
        {
            // TODO: Extract current user id from auth context
            string? currentUserId = null; 

            var user = await _userService.GetUserAsync(userId, currentUserId);
            if (user == null) return NotFound();

            return Ok(user);
        }

        [HttpGet("search")]
        public async Task<IActionResult> SearchUser([FromQuery] string q)
        {
            string? currentUserId = null;
            var users = await _userService.SearchUsersAsync(q, currentUserId);
            return Ok(users);
        }

        [HttpPatch("{id}")]
        public async Task<IActionResult> UpdateUser(string id, [FromBody] UpdateUserRequest body)
        {
            var user = await _userService.UpdateUserAsync(id, body);
            if (user == null) return NotFound();

            return Ok(user);
        }

        [HttpPost("{userId}/follow")]
        public async Task<IActionResult> FollowUser(string userId)
        {
            // Mocking current user since auth is not implemented yet
            string currentUserId = "mocked-current-user-id"; 
            
            var success = await _userService.FollowUserAsync(userId, currentUserId);
            if (!success) return BadRequest("Could not follow user.");

            return Ok();
        }

        [HttpDelete("{userId}")]
        public async Task<IActionResult> DeleteUser(string userId)
        {
            var success = await _userService.DeleteUserAsync(userId);
            if (!success) return NotFound();

            return NoContent();
        }
    }
}
