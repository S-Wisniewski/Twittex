namespace ModerationSystem.Api.Models.Entities
{
    public class User
    {
        public string CognitoUserId { get; set; } = string.Empty;
        public string AvatarUrl { get; set; } = string.Empty;
        public virtual ICollection<Post> Posts { get; set; } = new List<Post>();
        public virtual ICollection<PostLikes> LikedPosts { get; set; } = new List<PostLikes>();
        public virtual ICollection<UserFollows> Followers { get; set; } = new List<UserFollows>();
        public virtual ICollection<UserFollows> Following { get; set; } = new List<UserFollows>();
    }
}
