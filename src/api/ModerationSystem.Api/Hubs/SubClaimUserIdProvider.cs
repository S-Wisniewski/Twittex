using Microsoft.AspNetCore.SignalR;

namespace ModerationSystem.Api.Hubs
{
    public class SubClaimUserIdProvider : IUserIdProvider
    {
        public string? GetUserId(HubConnectionContext connection)
            => connection.User?.FindFirst("sub")?.Value;
    }
}
