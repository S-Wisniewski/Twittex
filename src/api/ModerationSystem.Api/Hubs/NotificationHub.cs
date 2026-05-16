using Microsoft.AspNetCore.SignalR;

namespace ModerationSystem.Api.Hubs
{
    public class NotificationHub : Hub
    {
        public override async Task OnConnectedAsync()
        {
            if (Context.User?.IsInRole("moderator") == true)
            {
                await Groups.AddToGroupAsync(Context.ConnectionId, "moderators");
            }

            await base.OnConnectedAsync();
        }
    }
}