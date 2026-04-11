using Microsoft.EntityFrameworkCore;
using ModerationSystem.Api.Models.Entities;

namespace ModerationSystem.Api.Data
{
    public class AppDbContext : DbContext
    {
        public DbSet<User> Users { get; set; }

        public DbSet<Post> Posts { get; set; }

        public DbSet<Review> Reviews { get; set; }

        public DbSet<PostLikes> PostLikes { get; set; }

        public DbSet<UserFollows> UserFollows { get; set; }

        public AppDbContext(DbContextOptions<AppDbContext> options)
            : base(options)
        {
        }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            modelBuilder.Entity<Post>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.HasOne(p => p.ParentPost)
                    .WithMany()
                    .HasForeignKey(p => p.ParentPostId)
                    .OnDelete(DeleteBehavior.Restrict);

                entity.HasOne(p => p.User)
                    .WithMany(u => u.Posts)
                    .HasForeignKey(p => p.CognitoUserId);
            });

            modelBuilder.Entity<PostLikes>(entity =>
            {
                entity.HasKey(pl => new { pl.CognitoUserId, pl.PostId });

                entity.HasOne(pl => pl.User)
                    .WithMany(u => u.LikedPosts)
                    .HasForeignKey(pl => pl.CognitoUserId)
                    .OnDelete(DeleteBehavior.Cascade);

                entity.HasOne(pl => pl.Post)
                    .WithMany(p => p.Likes)
                    .HasForeignKey(pl => pl.PostId)
                    .OnDelete(DeleteBehavior.Cascade);
            });

            modelBuilder.Entity<UserFollows>(entity =>
            {
                entity.HasKey(f => new { f.FollowerId, f.FollowedId });

                entity.HasOne(f => f.Follower)
                    .WithMany(u => u.Following)
                    .HasForeignKey(f => f.FollowerId)
                    .OnDelete(DeleteBehavior.Restrict);

                entity.HasOne(f => f.Followed)
                    .WithMany(u => u.Followers)
                    .HasForeignKey(f => f.FollowedId)
                    .OnDelete(DeleteBehavior.Restrict);
            });

            modelBuilder.Entity<Review>(entity =>
            {
                entity.HasKey(r => r.Id);
                entity.HasOne(r => r.Post)
                    .WithMany(p => p.Reviews)
                    .HasForeignKey(r => r.PostId);

                entity.HasOne(r => r.User)
                    .WithMany()
                    .HasForeignKey(r => r.CognitoUserId)
                    .OnDelete(DeleteBehavior.Restrict);
            });
        }
    }
}

