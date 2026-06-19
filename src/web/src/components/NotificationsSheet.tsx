import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { NotificationTrigger } from "@/types/Notification";
import type { PostStatus } from "@/types/Post";
import { CheckCheck, X as XIcon } from "lucide-react";
import { useNotifications } from "@/hooks/useNotifications";

const STATUS_COLOR: Record<PostStatus, string> = {
  Published: "text-emerald-600 dark:text-emerald-400",
  Pending: "text-amber-600 dark:text-amber-400",
  Flagged: "text-orange-600 dark:text-orange-400",
  Review: "text-sky-600 dark:text-sky-400",
  Rejected: "text-destructive",
  Error: "text-muted-foreground",
};

const TRIGGER_LABEL: Record<NotificationTrigger, string> = {
  system: "System",
  community: "Community reports",
};

function formatDate(iso: string) {
  const date = new Date(iso);
  const now = new Date();
  const diffMin = Math.floor((now.getTime() - date.getTime()) / 60_000);
  if (diffMin < 1) return "just now";
  if (diffMin < 60) return `${diffMin}m ago`;
  if (diffMin < 1440) return `${Math.floor(diffMin / 60)}h ago`;
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

type NotificationsSheetProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

const NotificationsSheet = ({ open, onOpenChange }: NotificationsSheetProps) => {
  const { notifications, markRead, markAllRead } = useNotifications();

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" showCloseButton={false} className="w-full sm:max-w-md flex flex-col p-0">
        <SheetHeader className="px-6 pt-6 pb-4 border-b flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <SheetTitle>Notifications</SheetTitle>
            {unreadCount > 0 && (
              <span className="rounded-full bg-primary px-2 py-0.5 text-xs font-medium text-primary-foreground shrink-0">
                {unreadCount}
              </span>
            )}
          </div>
          <div className="flex items-center gap-1 shrink-0">
            {unreadCount > 0 && (
              <Button
                variant="ghost"
                size="xs"
                className="text-muted-foreground gap-1"
                onClick={markAllRead}
              >
                <CheckCheck className="size-3" />
                Mark all read
              </Button>
            )}
            <SheetClose render={<Button variant="ghost" size="icon-sm" aria-label="Close" />}>
              <XIcon className="size-4" />
            </SheetClose>
          </div>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto">
          {notifications.length === 0 ? (
            <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
              No notifications yet
            </div>
          ) : (
            <ul className="divide-y">
              {notifications.map((n) => (
                <li
                  key={n.id}
                  className={cn(
                    "px-6 py-4 transition-colors cursor-pointer hover:bg-muted/50",
                    !n.read && "bg-primary/5",
                  )}
                  onClick={() => markRead(n.id)}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex flex-col gap-1 flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        {!n.read && (
                          <span className="size-2 rounded-full bg-primary shrink-0" />
                        )}
                        <span className="text-xs text-muted-foreground">
                          {n.oldStatus}
                          {" → "}
                        </span>
                        <span
                          className={cn(
                            "text-xs font-semibold",
                            STATUS_COLOR[n.newStatus],
                          )}
                        >
                          {n.newStatus}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          · {TRIGGER_LABEL[n.triggeredBy]}
                        </span>
                      </div>

                      <p className="text-sm truncate text-muted-foreground italic">
                        "{n.postExcerpt}"
                      </p>

                      <p className="text-xs text-muted-foreground leading-relaxed">
                        {n.reason}
                      </p>
                    </div>

                    <span className="text-xs text-muted-foreground shrink-0">
                      {formatDate(n.createdAt)}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default NotificationsSheet;
