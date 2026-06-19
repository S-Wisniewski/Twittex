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
            if (post == null || post.Status == PostStatus.Flagged) return; // Don't report already flagged posts

            // Prevent double reporting
            var existingReport = await _context.Reports.FirstOrDefaultAsync(r => r.PostId == postId && r.CognitoUserId == userId);
            if (existingReport != null) return;

            double weight = 1.0;
            if (user.ReputationScore >= 80) weight = 2.0;
            else if (user.ReputationScore < 30) weight = 0.2;

            var report = new Report
            {
                PostId = postId,
                CognitoUserId = userId,
                Reason = request.Reason,
                Description = request.Description,
                Weight = weight
            };

            _context.Reports.Add(report);
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

            if (riskScore >= threshold)
            {
                var topReports = reports
                    .OrderByDescending(r => r.User.ReputationScore)
                    .Take(5)
                    .ToList();

                var reportContext = string.Join("\n", topReports.Select(r => $"- Reason: {r.Reason}, Comment: {r.Description ?? "None"}"));

                var aiDecision = await _aiService.ReevaluatePostAsync(post.Content, reportContext);

                if (aiDecision == PostStatus.Flagged)
                {
                    var oldStatus = post.Status.ToString();
                    post.Status = PostStatus.Flagged;
                    post.User.ReputationScore -= 15.0;

                    foreach (var report in reports)
                    {
                        report.User.ReputationScore += 5.0;
                    }

                    _auditService.AddLog("System", $"Post {post.Id} flagged by AI after community reports.");
                    await _notificationsService.NotifyUserOfPostStatusChange(
                        post,
                        oldStatus,
                        "Your post was flagged following community reports and AI re-evaluation.",
                        "community");
                }
                else
                {
                    // AI decided it's a false alarm
                    foreach (var report in reports)
                    {
                        report.User.ReputationScore -= 3.0;
                    }
                    
                    _auditService.AddLog("System", $"Post {post.Id} reported but cleared by AI. Reporters penalized.");
                }

                // Soft delete reports so they don't trigger again for the same threshold
                foreach (var report in reports)
                {
                    report.DeletedAt = DateTime.UtcNow;
                }
                await _context.SaveChangesAsync();
            }
        }
    }
}
