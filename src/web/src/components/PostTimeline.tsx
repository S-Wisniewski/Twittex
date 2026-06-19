import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { PostStatus } from "@/types/Post";

export type TimelineEvent = {
  id: string;
  oldStatus: PostStatus;
  newStatus: PostStatus;
  reason: string;
  triggeredBy: "system" | "community";
  createdAt: string;
};

const STATUS_DOT: Record<PostStatus, string> = {
  Pending: "bg-amber-500",
  Published: "bg-emerald-500",
  Flagged: "bg-orange-500",
  Review: "bg-sky-500",
  Rejected: "bg-destructive",
  Error: "bg-destructive",
};

const TRIGGER_LABEL: Record<TimelineEvent["triggeredBy"], string> = {
  system: "System",
  community: "Community reports",
};

function formatSmartDate(iso: string) {
  const date = new Date(iso);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMin = Math.floor(diffMs / 60_000);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);

  if (diffMin < 1) return "just now";
  if (diffMin < 60) return `${diffMin}m ago`;
  if (diffHour < 24) return `${diffHour}h ago`;
  return `${diffDay}d ago`;
}

type PostTimelineProps = {
  events: TimelineEvent[];
  className?: string;
};

const PostTimeline = ({ events, className }: PostTimelineProps) => {
  const [expanded, setExpanded] = useState(false);

  if (!events.length) return null;

  return (
    <div className={cn("basis-full", className)}>
      <Button
        variant="ghost"
        size="xs"
        className="text-muted-foreground gap-1 -ml-2"
        onClick={() => setExpanded((p) => !p)}
      >
        {expanded ? <ChevronUp className="size-3" /> : <ChevronDown className="size-3" />}
        Status history
      </Button>

      {expanded && (
        <ol className="mt-2 flex flex-col gap-0 pl-1">
          {events.map((event, i) => (
            <li key={event.id} className="flex gap-3 relative">
              {/* vertical line */}
              {i < events.length - 1 && (
                <div className="absolute left-1.75 top-4 bottom-0 w-px bg-border" />
              )}

              {/* dot */}
              <div
                className={cn(
                  "relative z-10 mt-1 size-3.5 shrink-0 rounded-full border-2 border-background ring-1 ring-border",
                  STATUS_DOT[event.newStatus],
                )}
              />

              <div className="flex flex-col pb-4">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs font-medium">{event.newStatus}</span>
                  <span className="text-xs text-muted-foreground">
                    via {TRIGGER_LABEL[event.triggeredBy]}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    · {formatSmartDate(event.createdAt)}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
                  {event.reason}
                </p>
              </div>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
};

export default PostTimeline;
