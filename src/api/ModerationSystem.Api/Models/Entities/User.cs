namespace ModerationSystem.Api.Models.Entities
{
    public class User : BaseEntity
    {
        // role?
        public string Email { get; set; } = string.Empty;
        public string PhoneNumber { get; set; } = string.Empty;
        public string Name { get; set; } = string.Empty;
        public string UserName { get; set; } = string.Empty;
        // events
        public string AvatarUrl { get; set; } = string.Empty;
        public bool EmailConfirmed { get; set; }
        public bool PhoneNumberConfirmed { get; set; }
        public bool IsBanned { get; set; }


        public virtual ICollection<Post> Posts { get; set; } = new List<Post>();
        public virtual ICollection<PostLikes> LikedPosts { get; set; } = new List<PostLikes>();
        public virtual ICollection<UserFollows> Followers { get; set; } = new List<UserFollows>();
        public virtual ICollection<UserFollows> Following { get; set; } = new List<UserFollows>();
    }
}
