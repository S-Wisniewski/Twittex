import { useCallback, useEffect, useRef, useState } from "react";
import type { PostStatus } from "@/types/Post";
import { postsApi } from "@/api";

const POLL_INTERVAL_MS = 5_000;
const TERMINAL_STATUSES: PostStatus[] = ["Published", "Rejected"];

export function usePostStatus(postId: string, initialStatus: PostStatus) {
  const [status, setStatus] = useState<PostStatus>(initialStatus);
  const [isPolling, setIsPolling] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const stopPolling = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setIsPolling(false);
  }, []);

  const poll = useCallback(async () => {
    try {
      const post = await postsApi.getById(postId);
      setStatus(post.status);
      if (TERMINAL_STATUSES.includes(post.status)) {
        stopPolling();
      }
    } catch {
      // Silently ignore API errors during polling — keep showing last known value
    }
  }, [postId, stopPolling]);

  useEffect(() => {
    if (TERMINAL_STATUSES.includes(status)) return;

    setIsPolling(true);
    intervalRef.current = setInterval(poll, POLL_INTERVAL_MS);

    return stopPolling;
  }, [postId]); // eslint-disable-line react-hooks/exhaustive-deps

  return { status, setStatus, isPolling };
}
