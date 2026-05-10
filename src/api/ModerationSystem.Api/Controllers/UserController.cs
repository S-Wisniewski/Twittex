using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using ModerationSystem.Api.Models.Dto.UserDtos;
using ModerationSystem.Api.Services.Users;
using System.Security.Claims;

namespace ModerationSystem.Api.Controllers
{
    [ApiController]
    [Route("api/users")] // Using 'api/users' to match conventional routing, requirements said '/users'
    [Authorize]
    public class UserController : ControllerBase
    {
        private readonly IUserService _userService;

        public UserController(IUserService userService)
        {
            _userService = userService;
        }

        private string? GetCurrentUserId() => User.FindFirst("sub")?.Value;

        [HttpGet]
        [AllowAnonymous]
        public async Task<IActionResult> GetAll()
        {
            string? currentUserId = GetCurrentUserId();
            var users = await _userService.GetAllUsersAsync(currentUserId);
            return Ok(users);
        }

        [HttpGet("{userId}")]
        [AllowAnonymous]
        public async Task<IActionResult> GetUser(string userId)
        {
            string? currentUserId = GetCurrentUserId(); 

            var user = await _userService.GetUserAsync(userId, currentUserId);
            if (user == null) return NotFound();

            return Ok(user);
        }

        [HttpGet("search")]
        [AllowAnonymous]
        public async Task<IActionResult> SearchUser([FromQuery] string q)
        {
            string? currentUserId = GetCurrentUserId();
            var users = await _userService.SearchUsersAsync(q, currentUserId);
            return Ok(users);
        }

        [HttpPatch("{id}")]
        public async Task<IActionResult> UpdateUser(string id, [FromBody] UpdateUserRequest body)
        {
            string? currentUserId = GetCurrentUserId();
            if (currentUserId != id) return Forbid();

            var user = await _userService.UpdateUserAsync(id, body);
            if (user == null) return NotFound();

            return Ok(user);
        }

        [HttpPost("{userId}/follow")]
        public async Task<IActionResult> FollowUser(string userId)
        {
            string? currentUserId = GetCurrentUserId();
            if (currentUserId == null) return Unauthorized();
            
            var success = await _userService.FollowUserAsync(userId, currentUserId);
            if (!success) return BadRequest("Could not follow user.");

            return Ok();
        }

        [HttpDelete("{userId}")]
        public async Task<IActionResult> DeleteUser(string userId)
        {
            string? currentUserId = GetCurrentUserId();
            if (currentUserId != userId) return Forbid();

            var success = await _userService.DeleteUserAsync(userId);
            if (!success) return NotFound();

            return NoContent();
        }
    }
}
