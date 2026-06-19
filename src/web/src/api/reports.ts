import { apiClient } from "./client";
import type { ReviewType } from "@/types/Post";

export type CreateReportDto = {
  reason: ReviewType;
  description?: string;
};

export const reportsApi = {
  create: (postId: string, dto: CreateReportDto) =>
    apiClient.post<void>(`/api/reports/${postId}`, dto),
};
