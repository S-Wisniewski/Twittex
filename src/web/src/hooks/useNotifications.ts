import { useState, useEffect, useRef } from "react";
import * as signalR from "@microsoft/signalr";
import { useQueryClient, type InfiniteData } from "@tanstack/react-query";
import { toast } from "sonner";
import type { Notification, NotificationTrigger } from "@/types/Notification";
import type { Post, PostStatus } from "@/types/Post";
import { useAuth } from "@/contexts/useAuth";
import { postsApi } from "@/api/posts";

const HUB_URL = `${import.meta.env.VITE_API_URL ?? "http://localhost:5260"}/hubs/notifications`;

function statusReason(status: PostStatus): string {
  switch (status) {
    case "Flagged":  return "Your post was reported by the community and is pending re-review.";
    case "Rejected": return "Your post was rejected by automated content moderation for policy violations.";
    case "Error":    return "Automated moderation could not process this post. It will be reviewed manually.";
    default:         return "Your post is awaiting automated review.";
  }
}

export function useNotifications() {
  const { currentUser } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const connectionRef = useRef<signalR.HubConnection | null>(null);
  const queryClient = useQueryClient();

  // Seed initial state from persisted post statuses on login
  useEffect(() => {
    if (!currentUser) return;

    postsApi.getMyPostStatuses().then((posts) => {
      const initial: Notification[] = posts.map((post) => ({
        id: `status-${post.id}`,
        postId: post.id,
        postExcerpt: post.content.length > 100 ? post.content.slice(0, 100) + "…" : post.content,
        oldStatus: "Pending",
        newStatus: post.status,
        reason: statusReason(post.status),
        triggeredBy: "system" as const,
        createdAt: post.createdAt,
        read: false,
      }));
      setNotifications(initial);
    });
  }, [currentUser]);

  // Real-time SignalR updates
  useEffect(() => {
    if (!currentUser) return;

    const connection = new signalR.HubConnectionBuilder()
      .withUrl(HUB_URL, {
        accessTokenFactory: () => sessionStorage.getItem("accessToken") ?? "",
      })
      .withAutomaticReconnect()
      .configureLogging(signalR.LogLevel.Warning)
      .build();

    connection.on("PostStatusChanged", (payload: {
      id: string;
      postExcerpt: string;
      oldStatus: PostStatus | null;
      newStatus: PostStatus;
      reason: string | null;
      triggeredBy: NotificationTrigger;
    }) => {
      const notification: Notification = {
        id: crypto.randomUUID(),
        postId: payload.id,
        postExcerpt: payload.postExcerpt ?? "",
        oldStatus: payload.oldStatus ?? "Pending",
        newStatus: payload.newStatus,
        reason: payload.reason ?? "",
        triggeredBy: payload.triggeredBy ?? "system",
        createdAt: new Date().toISOString(),
        read: false,
      };
      // Replace any existing seeded entry for this post, then prepend the live one
      setNotifications((prev) => [
        notification,
        ...prev.filter((n) => n.postId !== payload.id),
      ]);

      // Update feed + profile cache so the post status reflects immediately
      queryClient.setQueriesData<InfiniteData<Post[]>>(
        { queryKey: ["feed"] },
        (old) => {
          if (!old) return old;
          return {
            ...old,
            pages: old.pages.map((page) =>
              page.map((p) => (p.id === payload.id ? { ...p, status: payload.newStatus } : p)),
            ),
          };
        },
      );
      queryClient.setQueriesData<Post[]>(
        { queryKey: ["userPosts"] },
        (old) => old?.map((p) => (p.id === payload.id ? { ...p, status: payload.newStatus } : p)),
      );
      // Refresh the audit log shown inside the post
      queryClient.invalidateQueries({ queryKey: ["posts", payload.id, "logs"] });

      // Toast so the user knows without opening notifications
      if (payload.newStatus === "Published") {
        toast.success("Post published");
      } else if (payload.newStatus === "Rejected") {
        toast.error("Post rejected", { description: payload.reason ?? undefined });
      } else if (payload.newStatus === "Error") {
        toast.warning("Moderation error — your post will be reviewed manually");
      } else if (payload.newStatus === "Flagged") {
        toast.warning("Your post has been flagged for re-review");
      }
    });

    connection.start().catch((err) =>
      console.warn("SignalR connection failed:", err),
    );
    connectionRef.current = connection;

    return () => {
      connection.stop();
      connectionRef.current = null;
    };
  }, [currentUser, queryClient]);

  const markRead = (id: string) =>
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n)),
    );

  const markAllRead = () =>
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));

  return { notifications, markRead, markAllRead };
}
