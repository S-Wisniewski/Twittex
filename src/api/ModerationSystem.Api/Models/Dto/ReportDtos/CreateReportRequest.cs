using ModerationSystem.Api.Models.Enums;
using System.ComponentModel.DataAnnotations;

namespace ModerationSystem.Api.Models.Dto.ReportDtos
{
    public class CreateReportRequest
    {
        [Required]
        public ReportReason Reason { get; set; }

        [MaxLength(500)]
        public string? Description { get; set; }
    }
}
