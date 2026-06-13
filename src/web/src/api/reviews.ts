import { apiClient } from "./client";
import type { ReviewType } from "@/types/Post";

export type CreateReviewDto = {
  reviewType: ReviewType;
  description?: string;
};

export type Review = {
  id: number;
  postId: number;
  cognitoUserId: string;
  reviewType: ReviewType;
  description?: string;
  createdAt: string;
};

export const reviewsApi = {
  create: (postId: string, dto: CreateReviewDto) =>
    apiClient.post<Review>(`/api/posts/${postId}/reviews`, dto),

  getByPost: (postId: string) =>
    apiClient.get<Review[]>(`/api/posts/${postId}/reviews`),
};
