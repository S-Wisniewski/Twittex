import { useState, useEffect, useRef } from "react";
import * as signalR from "@microsoft/signalr";
import { useQueryClient, type InfiniteData } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import type { Notification, NotificationTrigger } from "@/types/Notification";
import type { Post, PostStatus } from "@/types/Post";
import { useAuth } from "@/contexts/useAuth";
import { postsApi } from "@/api/posts";

const HUB_URL = `${import.meta.env.VITE_API_URL ?? "http://localhost:5260"}/hubs/notifications`;

export function useNotifications() {
  const { t } = useTranslation();
  const { currentUser } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const connectionRef = useRef<signalR.HubConnection | null>(null);
  const queryClient = useQueryClient();

  function statusReason(status: PostStatus): string {
    switch (status) {
      case "Flagged":  return t("notifications.reasons.flagged");
      case "Rejected": return t("notifications.reasons.rejected");
      case "Error":    return t("notifications.reasons.error");
      default:         return t("notifications.reasons.default");
    }
  }

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
      }));
      setNotifications(initial);
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUser]);

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
        id: crypto.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(36).slice(2)}`,
        postId: payload.id,
        postExcerpt: payload.postExcerpt ?? "",
        oldStatus: payload.oldStatus ?? "Pending",
        newStatus: payload.newStatus,
        reason: statusReason(payload.newStatus),
        triggeredBy: payload.triggeredBy ?? "system",
        createdAt: new Date().toISOString(),
      };
      setNotifications((prev) => [
        notification,
        ...prev.filter((n) => n.postId !== payload.id),
      ]);

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
      queryClient.invalidateQueries({ queryKey: ["posts", payload.id, "logs"] });

      if (payload.newStatus === "Published") {
        toast.success(t("notifications.toasts.published"));
      } else if (payload.newStatus === "Rejected") {
        toast.error(t("notifications.toasts.rejected"), { description: payload.reason ?? undefined });
      } else if (payload.newStatus === "Error") {
        toast.warning(t("notifications.toasts.error"));
      } else if (payload.newStatus === "Flagged") {
        toast.warning(t("notifications.toasts.flagged"));
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
  }, [currentUser, queryClient, t]);

  return { notifications };
}
