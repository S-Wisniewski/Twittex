export type User = {
  id: string;
  userName: string;
  userId: string;
  createdAt: string;
  content: string;
  userAvatarUrl: string;
  isLiked: boolean;
  following: number;
  followers: number;
  youFollow: boolean;
};

export const mockProfile = {
  id: "12313123",
  userName: "Epstein",
  userId: "EpsteinIslandBoy",
  createdAt: new Date().toISOString(),
  content: "I love my island",
  // userAvatarUrl:
  //   "https://d3i6fh83elv35t.cloudfront.net/static/2024/01/epstein-1024x683.jpg",
  userAvatarUrl:
    "https://png.pngtree.com/png-clipart/20240830/original/pngtree-oberhasli-goat-png-image_15883761.png",
  isLiked: false,
  following: 12345,
  followers: 666,
  youFollow: true,
};
