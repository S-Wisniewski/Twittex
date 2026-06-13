import type { PostStatus } from "./Post";

export type NotificationTrigger = "llm" | "moderator" | "community" | "system";

export type Notification = {
  id: string;
  postId: string;
  postExcerpt: string;
  oldStatus: PostStatus;
  newStatus: PostStatus;
  reason: string;
  triggeredBy: NotificationTrigger;
  createdAt: string;
  read: boolean;
};

const TRIGGER_LABELS: Record<NotificationTrigger, string> = {
  llm: "AI assessment",
  moderator: "Manual review",
  community: "Community reports",
  system: "System",
};

export { TRIGGER_LABELS };
