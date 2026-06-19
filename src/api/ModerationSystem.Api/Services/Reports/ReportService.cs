using Microsoft.EntityFrameworkCore;
using ModerationSystem.Api.Data;
using ModerationSystem.Api.Models.Dto.ReportDtos;
using ModerationSystem.Api.Models.Entities;
using ModerationSystem.Api.Models.Enums;
using ModerationSystem.Api.Services.Ai;
using ModerationSystem.Api.Services.Audit;
using ModerationSystem.Api.Services.Notifications;

namespace ModerationSystem.Api.Services.Reports
{
    public class ReportService : IReportService
    {
        private readonly AppDbContext _context;
        private readonly IAiService _aiService;
        private readonly IAuditService _auditService;
        private readonly INotificationService _notificationsService;

        public ReportService(
            AppDbContext context,
            IAiService aiService,
            IAuditService auditService,
            INotificationService notificationsService)
        {
            _context = context;
            _aiService = aiService;
            _auditService = auditService;
            _notificationsService = notificationsService;
        }

        public async Task CreateReportAsync(int postId, string userId, CreateReportRequest request)
        {
            var user = await _context.Users.FirstOrDefaultAsync(u => u.CognitoUserId == userId);
            if (user == null) return;

            var post = await _context.Posts.FirstOrDefaultAsync(p => p.Id == postId);
            if (post == null || post.Status == PostStatus.Rejected || post.Status == PostStatus.Flagged) return;

            var existingReport = await _context.Reports.FirstOrDefaultAsync(r => r.PostId == postId && r.CognitoUserId == userId);
            if (existingReport != null) return;

            double weight = 1.0;
            if (user.ReputationScore >= 80) weight = 2.0;
            else if (user.ReputationScore < 30) weight = 0.2;

            _context.Reports.Add(new Report
            {
                PostId = postId,
                CognitoUserId = userId,
                Reason = request.Reason,
                Description = request.Description,
                Weight = weight
            });
            await _context.SaveChangesAsync();

            await CheckRiskScoreAndReevaluateAsync(postId);
        }

        private async Task CheckRiskScoreAndReevaluateAsync(int postId)
        {
            var post = await _context.Posts
                .Include(p => p.User)
                .FirstOrDefaultAsync(p => p.Id == postId);

            if (post == null) return;

            var reports = await _context.Reports
                .Include(r => r.User)
                .Where(r => r.PostId == postId)
                .ToListAsync();

            double riskScore = reports.Sum(r => r.Weight);

            double threshold = 5.0;
            if (post.User.ReputationScore >= 80) threshold = 7.5;
            else if (post.User.ReputationScore < 30) threshold = 2.5;

            if (riskScore < threshold) return;

            var topReports = reports
                .OrderByDescending(r => r.User.ReputationScore)
                .Take(5)
                .ToList();

            var reportContext = string.Join("\n", topReports.Select(r => $"- Reason: {r.Reason}, Comment: {r.Description ?? "None"}"));

            // Mark as Flagged immediately while AI re-evaluates
            var preAiStatus = post.Status;
            post.Status = PostStatus.Flagged;
            _auditService.AddStatusLog(post.CognitoUserId, post.Id, preAiStatus, PostStatus.Flagged,
                "Community reports triggered re-review.", "community");
            await _context.SaveChangesAsync();
            await _notificationsService.NotifyUserOfPostStatusChange(post, preAiStatus.ToString(),
                "Your post was reported by the community and is pending automated re-review.", "community");

            var aiDecision = await _aiService.ReevaluatePostAsync(post.Content, reportContext);

            if (aiDecision == PostStatus.Rejected)
            {
                post.Status = PostStatus.Rejected;
                post.User.ReputationScore -= 15.0;
                foreach (var report in reports) report.User.ReputationScore += 5.0;

                _auditService.AddStatusLog(post.CognitoUserId, post.Id, PostStatus.Flagged, PostStatus.Rejected,
                    "Automated re-evaluation confirmed the content violates community guidelines.", "system");
                await _notificationsService.NotifyUserOfPostStatusChange(post, "Flagged",
                    "Your post was rejected following automated re-evaluation after community reports.", "system");
            }
            else
            {
                post.Status = PostStatus.Published;
                foreach (var report in reports) report.User.ReputationScore -= 3.0;

                _auditService.AddStatusLog(post.CognitoUserId, post.Id, PostStatus.Flagged, PostStatus.Published,
                    "Automated re-evaluation found no policy violations. Post restored.", "system");
                await _notificationsService.NotifyUserOfPostStatusChange(post, "Flagged",
                    "Your post was cleared after automated re-evaluation and is now live again.", "system");
            }

            foreach (var report in reports) report.DeletedAt = DateTime.UtcNow;
            await _context.SaveChangesAsync();
        }
    }
}
