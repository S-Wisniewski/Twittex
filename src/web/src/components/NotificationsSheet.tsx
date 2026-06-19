import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import type { NotificationTrigger } from "@/types/Notification";
import type { PostStatus } from "@/types/Post";
import { X as XIcon } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useNotifications } from "@/hooks/useNotifications";

const STATUS_COLOR: Record<PostStatus, string> = {
  Published: "text-emerald-600 dark:text-emerald-400",
  Pending: "text-amber-600 dark:text-amber-400",
  Flagged: "text-orange-600 dark:text-orange-400",
  Review: "text-sky-600 dark:text-sky-400",
  Rejected: "text-destructive",
  Error: "text-muted-foreground",
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
  const { t } = useTranslation();
  const { notifications } = useNotifications();

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" showCloseButton={false} className="w-full sm:max-w-md flex flex-col p-0">
        <SheetHeader className="px-6 pt-6 pb-4 border-b flex-row items-center justify-between gap-2">
          <SheetTitle>{t("notifications.title")}</SheetTitle>
          <SheetClose render={<Button variant="ghost" size="icon-sm" aria-label="Close" />}>
            <XIcon className="size-4" />
          </SheetClose>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto">
          {notifications.length === 0 ? (
            <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
              {t("notifications.empty")}
            </div>
          ) : (
            <ul className="divide-y">
              {notifications.map((n) => (
                <li
                  key={n.id}
                  className="px-6 py-4 hover:bg-muted/50"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex flex-col gap-1 flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs text-muted-foreground">
                          {t(`postStatus.${n.oldStatus}`)}
                          {" → "}
                        </span>
                        <span
                          className={`text-xs font-semibold ${STATUS_COLOR[n.newStatus]}`}
                        >
                          {t(`postStatus.${n.newStatus}`)}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          · {t(`notifications.triggers.${n.triggeredBy}` as NotificationTrigger)}
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
