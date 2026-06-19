import { apiClient } from "./client";
import type { User } from "@/types/User";

export type UpdateProfileDto = {
  displayName?: string;
  username?: string;
  bio?: string;
  avatarUrl?: string;
};

export const usersApi = {
  getMe: () => apiClient.get<User>("/api/users/me"),

  getById: (userId: string) => apiClient.get<User>(`/api/users/${userId}`),

  search: (query: string) =>
    apiClient.get<User[]>(`/api/users/search?q=${encodeURIComponent(query)}`),

  updateProfile: (userId: string, dto: UpdateProfileDto) =>
    apiClient.patch<User>(`/api/users/${userId}`, dto),

  follow: (userId: string) =>
    apiClient.post<void>(`/api/users/${userId}/follow`),

  unfollow: (userId: string) =>
    apiClient.delete<void>(`/api/users/${userId}/follow`),

  deleteAccount: (userId: string) =>
    apiClient.delete<void>(`/api/users/${userId}`),
};
