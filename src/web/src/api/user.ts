import { apiClient } from "./client";

export type UpdateProfileDto = {
  displayName?: string;
  userName?: string;
  bio?: string;
  avatarUrl?: string;
};

export type UserProfile = {
  id: string;
  userName: string;
  content: string;
  userAvatarUrl: string;
  followers: number;
  following: number;
  youFollow: boolean;
};

export const userApi = {
  updateProfile: (userId: string, body: UpdateProfileDto) =>
    apiClient.patch<UserProfile>(`/api/users/${userId}`, body),
};
