import type { PostStatus } from "./Post";

export type NotificationTrigger = "system" | "community";

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
  system: "System",
  community: "Community reports",
};

export { TRIGGER_LABELS };
