using AutoMapper;
using ModerationSystem.Api.Models.Dto.PostDtos;
using ModerationSystem.Api.Models.Entities;

namespace ModerationSystem.Api.Mappings
{
    public class MappingProfile : Profile
    {
        public MappingProfile()
        {
            #region Post Mappings
                CreateMap<Post, PostDto>()
                    .ForMember(dest => dest.Status, opt => opt.MapFrom(src => src.Status.ToString()));
                CreateMap<CreatePostDto, Post>();
                CreateMap<UpdatePostDto, Post>();
            #endregion
        }
    }
}
