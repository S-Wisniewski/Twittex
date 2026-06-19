using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using ModerationSystem.Api.Models.Dto.ReportDtos;
using ModerationSystem.Api.Services.Reports;

namespace ModerationSystem.Api.Controllers
{
    [ApiController]
    [Route("api/reports")]
    [Authorize]
    public class ReportController : ControllerBase
    {
        private readonly IReportService _reportService;

        public ReportController(IReportService reportService)
        {
            _reportService = reportService;
        }

        private string? GetCurrentUserId() => User.FindFirst("sub")?.Value;

        [HttpPost("{postId}")]
        public async Task<IActionResult> CreateReport(int postId, [FromBody] CreateReportRequest request)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);

            string? currentUserId = GetCurrentUserId();
            if (currentUserId == null) return Unauthorized();

            await _reportService.CreateReportAsync(postId, currentUserId, request);
            return Ok();
        }
    }
}
