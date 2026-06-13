import { apiClient } from "./client";
import type { Post, PostStatus } from "@/types/Post";

export type CreatePostDto = {
  content: string;
  parentPostId?: number;
};

export type PostLog = {
  id: number;
  oldStatus: PostStatus;
  newStatus: PostStatus;
  reason: string;
  triggeredBy: "llm" | "moderator" | "community" | "system";
  createdAt: string;
};

export const postsApi = {
  getFeed: () => apiClient.get<Post[]>("/api/posts"),

  getById: (id: string) => apiClient.get<Post>(`/api/posts/${id}`),

  getByUser: (userId: string) =>
    apiClient.get<Post[]>(`/api/users/${userId}/posts`),

  create: (dto: CreatePostDto) => apiClient.post<Post>("/api/posts", dto),

  getLogs: (id: string) =>
    apiClient.get<PostLog[]>(`/api/posts/${id}/logs`),

  like: (id: string) => apiClient.post<void>(`/api/posts/${id}/likes`),

  unlike: (id: string) => apiClient.delete<void>(`/api/posts/${id}/likes`),
};
