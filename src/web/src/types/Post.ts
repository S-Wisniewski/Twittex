import { isoMinus } from "@/lib/utils";

export type PostStatus = "Pending" | "Published" | "Flagged" | "Review" | "Rejected" | "Error";

export type ReviewType =
  | "InappropriateContent"
  | "Spam"
  | "Harassment"
  | "HateSpeech"
  | "Misinformation"
  | "Other";

export type Post = {
  id: string;
  userName: string;
  userId: string;
  parentPostId?: number | null;
  parentUserName?: string | null;
  createdAt: string;
  content: string;
  userAvatarUrl: string;
  isLiked: boolean;
  status: PostStatus;
  likeCount: number;
  commentCount: number;
};

export type ReplyThread = {
  ancestors: Post[];
  reply: Post;
};

export const mockPost: Post = {
  id: "12313123",
  userName: "Epstein",
  userId: "EpsteinIslandBoy",
  createdAt: isoMinus({
    seconds: 60,
    minutes: 60,
    hours: 24,
    days: 14,
    years: 2,
  }),
  content: "I love my island",
  userAvatarUrl:
    "https://png.pngtree.com/png-clipart/20240830/original/pngtree-oberhasli-goat-png-image_15883761.png",
  isLiked: false,
  status: "Published",
  likeCount: 42,
  commentCount: 7,
};
