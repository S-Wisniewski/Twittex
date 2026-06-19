import { apiClient } from "./client";
import type { Post, PostStatus, ReplyThread } from "@/types/Post";

export type CreatePostDto = {
  content: string;
  parentPostId?: number;
};

export type PostLog = {
  id: string;
  oldStatus: PostStatus;
  newStatus: PostStatus;
  reason: string;
  triggeredBy: "system" | "community";
  createdAt: string;
};

export const postsApi = {
  getFeed: (page = 1, pageSize = 15) =>
    apiClient.get<Post[]>(`/api/posts?page=${page}&pageSize=${pageSize}`),

  getById: (id: string) => apiClient.get<Post>(`/api/posts/${id}`),

  getByUser: (userId: string) =>
    apiClient.get<Post[]>(`/api/users/${userId}/posts`),

  create: (dto: CreatePostDto) => apiClient.post<Post>("/api/posts", dto),

  getLogs: (id: string) =>
    apiClient.get<PostLog[]>(`/api/posts/${id}/logs`),

  like: (id: string) => apiClient.post<void>(`/api/posts/${id}/likes`),

  unlike: (id: string) => apiClient.delete<void>(`/api/posts/${id}/likes`),

  delete: (id: string) => apiClient.delete<void>(`/api/posts/${id}`),

  getComments: (postId: string) =>
    apiClient.get<Post[]>(`/api/posts/${postId}/comments`),

  getRepliesByUser: (userId: string) =>
    apiClient.get<ReplyThread[]>(`/api/users/${userId}/replies`),

  getAncestors: (postId: string) =>
    apiClient.get<Post[]>(`/api/posts/${postId}/ancestors`),

  getMyPostStatuses: () =>
    apiClient.get<Post[]>(`/api/users/me/post-statuses`),
};
