using ModerationSystem.Api.Models.Dto.ReportDtos;

namespace ModerationSystem.Api.Services.Reports
{
    public interface IReportService
    {
        Task CreateReportAsync(int postId, string userId, CreateReportRequest request);
    }
}
