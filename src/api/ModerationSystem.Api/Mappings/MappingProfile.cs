using AutoMapper;
using ModerationSystem.Api.Models.Dto.PostDtos;
using ModerationSystem.Api.Models.Dto.UserDtos;
using ModerationSystem.Api.Models.Entities;

namespace ModerationSystem.Api.Mappings
{
    public class MappingProfile : Profile
    {
        public MappingProfile()
        {
            CreateMap<Post, PostResponse>()
                .ForMember(dest => dest.Id, opt => opt.MapFrom(src => src.Id.ToString()))
                .ForMember(dest => dest.UserName, opt => opt.MapFrom(src => src.User != null ? src.User.UserName : string.Empty))
                .ForMember(dest => dest.UserId, opt => opt.MapFrom(src => src.CognitoUserId))
                .ForMember(dest => dest.UserAvatarUrl, opt => opt.MapFrom(src => src.User != null ? src.User.AvatarUrl : string.Empty))
                .ForMember(dest => dest.LikeCount, opt => opt.MapFrom(src => src.Likes.Count))
                .ForMember(dest => dest.CommentCount, opt => opt.MapFrom(src => src.Replies.Count))
                .ForMember(dest => dest.IsLiked, opt => opt.Ignore()); // Context dependent

            CreateMap<User, UserResponse>()
                .ForMember(dest => dest.Id, opt => opt.MapFrom(src => src.CognitoUserId))
                .ForMember(dest => dest.UserId, opt => opt.MapFrom(src => src.CognitoUserId))
                .ForMember(dest => dest.Content, opt => opt.MapFrom(src => src.Bio ?? string.Empty))
                .ForMember(dest => dest.UserAvatarUrl, opt => opt.MapFrom(src => src.AvatarUrl ?? string.Empty))
                .ForMember(dest => dest.Followers, opt => opt.MapFrom(src => src.Followers.Count))
                .ForMember(dest => dest.Following, opt => opt.MapFrom(src => src.Following.Count))
                .ForMember(dest => dest.YouFollow, opt => opt.Ignore()) // Context dependent
                .ForMember(dest => dest.IsLiked, opt => opt.Ignore());

            CreateMap<Log, PostLogResponse>()
                .ForMember(dest => dest.Id, opt => opt.MapFrom(src => src.Id.ToString()));

            CreateMap<Review, ReviewResponse>()
                .ForMember(dest => dest.Id, opt => opt.MapFrom(src => src.Id.ToString()));
        }
    }
}
