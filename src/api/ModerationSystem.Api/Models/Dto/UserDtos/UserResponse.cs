namespace ModerationSystem.Api.Models.Dto.UserDtos
{
    public class UserResponse
    {
        public string Id { get; set; } = string.Empty;
        public string UserName { get; set; } = string.Empty;
        public string UserId { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; }
        public string Content { get; set; } = string.Empty; // From Bio
        public string UserAvatarUrl { get; set; } = string.Empty;
        public bool IsLiked { get; set; }
        public int Following { get; set; }
        public int Followers { get; set; }
        public bool YouFollow { get; set; }
    }
}
