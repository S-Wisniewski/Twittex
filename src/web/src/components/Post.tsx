import { Flag, Heart, MessageSquare } from "lucide-react";
import {
  Item,
  ItemActions,
  ItemContent,
  ItemFooter,
  ItemHeader,
} from "./ui/item";
import { Button } from "./ui/button";
import { useState } from "react";
import { useNavigate } from "react-router";
import UserAvatar from "./UserAvatar";
import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import { Textarea } from "./ui/textarea";
import { toast } from "sonner";
import PostTimeline, { type TimelineEvent } from "./PostTimeline";
import { isoMinus } from "@/lib/utils";
import type { PostStatus, ReviewType } from "@/types/Post";

type PostProps = {
  id: string;
  userName: string;
  userId: string;
  userAvatarUrl: string;
  createdAt: string;
  content: string;
  isLiked: boolean;
  status: PostStatus;
  likeCount: number;
  commentCount: number;
};

const STATUS_CONFIG: Record<
  PostStatus,
  { label: string; className: string } | null
> = {
  Published: null,
  Pending: {
    label: "Pending review",
    className: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
  },
  Flagged: {
    label: "Flagged",
    className: "bg-orange-500/10 text-orange-600 dark:text-orange-400",
  },
  Review: {
    label: "Under manual review",
    className: "bg-sky-500/10 text-sky-600 dark:text-sky-400",
  },
  Rejected: {
    label: "Hidden — policy violation",
    className:
      "bg-destructive/10 text-destructive dark:text-destructive-foreground",
  },
};

const REVIEW_TYPE_LABELS: Record<ReviewType, string> = {
  InappropriateContent: "Inappropriate content",
  Spam: "Spam",
  Harassment: "Harassment",
  HateSpeech: "Hate speech",
  Misinformation: "Misinformation",
  Other: "Other",
};

function buildMockTimeline(status: PostStatus): TimelineEvent[] {
  const base: TimelineEvent[] = [
    {
      id: "t0",
      oldStatus: null,
      newStatus: "Pending",
      reason: "Post submitted — awaiting automated assessment.",
      triggeredBy: "system",
      createdAt: isoMinus({ minutes: 10 }),
    },
  ];

  if (status === "Pending") return base;

  if (status === "Published") {
    return [
      ...base,
      {
        id: "t1",
        oldStatus: "Pending",
        newStatus: "Published",
        reason:
          "Automated assessment passed. Toxicity score: 0.06/1.0. No policy violations detected.",
        triggeredBy: "llm",
        createdAt: isoMinus({ minutes: 7 }),
      },
    ];
  }

  if (status === "Flagged") {
    return [
      ...base,
      {
        id: "t1",
        oldStatus: "Pending",
        newStatus: "Published",
        reason: "Automated assessment passed. Toxicity score: 0.09/1.0.",
        triggeredBy: "llm",
        createdAt: isoMinus({ minutes: 9 }),
      },
      {
        id: "t2",
        oldStatus: "Published",
        newStatus: "Flagged",
        reason:
          "2 community reports received (weighted score: 1.8). Reason: Misinformation.",
        triggeredBy: "community",
        createdAt: isoMinus({ minutes: 5 }),
      },
    ];
  }

  if (status === "Review") {
    return [
      ...base,
      {
        id: "t1",
        oldStatus: "Pending",
        newStatus: "Flagged",
        reason:
          "Automated assessment flagged content. Toxicity score: 0.61/1.0.",
        triggeredBy: "llm",
        createdAt: isoMinus({ minutes: 8 }),
      },
      {
        id: "t2",
        oldStatus: "Flagged",
        newStatus: "Review",
        reason:
          "Risk score exceeded threshold (0.82/1.0). Escalated to manual moderator review.",
        triggeredBy: "system",
        createdAt: isoMinus({ minutes: 4 }),
      },
    ];
  }

  if (status === "Rejected") {
    return [
      ...base,
      {
        id: "t1",
        oldStatus: "Pending",
        newStatus: "Review",
        reason:
          "Automated assessment flagged severe content. Score: 0.91/1.0.",
        triggeredBy: "llm",
        createdAt: isoMinus({ minutes: 9 }),
      },
      {
        id: "t2",
        oldStatus: "Review",
        newStatus: "Rejected",
        reason:
          "Manual review completed. Content violates harassment policy (§3.2). Post permanently hidden.",
        triggeredBy: "moderator",
        createdAt: isoMinus({ minutes: 2 }),
      },
    ];
  }

  return base;
}

function formatSmartDate(iso: string) {
  const date = new Date(iso);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHour = Math.floor(diffMin / 60);
  const isToday = now.toDateString() === date.toDateString();
  const isThisYear = now.getFullYear() === date.getFullYear();

  if (isToday) {
    if (diffSec < 60) return `${diffSec}s ago`;
    if (diffMin < 60) return `${diffMin}m ago`;
    return `${diffHour}h ago`;
  }
  if (isThisYear)
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function formatCount(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return String(n);
}

const Post = ({
  post: camePost,
  disableComments = false,
  isAuthor = false,
  onReply,
}: {
  post: PostProps;
  disableComments?: boolean;
  isAuthor?: boolean;
  onReply?: () => void;
}) => {
  const navigate = useNavigate();
  const [post, setPost] = useState(camePost);

  const [reportOpen, setReportOpen] = useState(false);
  const [reportType, setReportType] = useState<ReviewType>(
    "InappropriateContent",
  );
  const [reportDescription, setReportDescription] = useState("");

  const handleReport = () => {
    // TODO: reviewsApi.create(post.id, { reviewType: reportType, description: reportDescription })
    toast.success("Post reported", {
      description: `Reason: ${REVIEW_TYPE_LABELS[reportType]}. Our team will review it shortly.`,
    });
    setReportOpen(false);
    setReportDescription("");
  };

  const statusConfig = STATUS_CONFIG[post.status];
  const timeline = isAuthor ? buildMockTimeline(post.status) : [];

  return (
    <Item variant={"outline"} className="gap-2">
      {statusConfig && (
        <div
          className={cn(
            "basis-full rounded-lg px-3 py-1.5 text-xs font-medium",
            statusConfig.className,
          )}
        >
          {statusConfig.label}
        </div>
      )}

      <ItemHeader className="mb-2">
        <div className="flex gap-4 items-center">
          <UserAvatar url={post.userAvatarUrl} name={post.userName} />
          <div className="flex flex-col">
            <span
              className="hover:underline hover:cursor-pointer"
              onClick={() => navigate(`/${post.userId}`)}
            >
              {post.userName}
            </span>
            <span className="text-sm text-muted-foreground">
              @{post.userId}
            </span>
          </div>
        </div>

        {!isAuthor && (
        <Dialog open={reportOpen} onOpenChange={setReportOpen}>
          <DialogTrigger
            render={
              <Button variant={"link"} size={"icon"}>
                <Flag />
              </Button>
            }
          />
          <DialogContent showCloseButton={false}>
            <DialogHeader>
              <DialogTitle className="text-center">Report this post</DialogTitle>
              <DialogDescription className="text-center">
                Select a reason and optionally describe the issue.
              </DialogDescription>
            </DialogHeader>

            <div className="flex flex-col gap-3">
              <select
                value={reportType}
                onChange={(e) => setReportType(e.target.value as ReviewType)}
                className="w-full rounded-xl border border-input bg-input/30 px-3 py-2 text-sm outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 transition-colors"
              >
                {(Object.keys(REVIEW_TYPE_LABELS) as ReviewType[]).map(
                  (key) => (
                    <option key={key} value={key}>
                      {REVIEW_TYPE_LABELS[key]}
                    </option>
                  ),
                )}
              </select>

              <Textarea
                placeholder="Additional details (optional)"
                value={reportDescription}
                onChange={(e) => setReportDescription(e.target.value)}
                maxLength={500}
              />
              <span className="text-xs text-muted-foreground text-right">
                {reportDescription.length}/500
              </span>
            </div>

            <DialogFooter className="flex items-center justify-center! gap-4">
              <DialogClose render={<Button variant="outline">Cancel</Button>} />
              <Button variant={"destructive"} onClick={handleReport}>
                Report
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        )}
      </ItemHeader>

      <ItemContent>{post.content}</ItemContent>

      {isAuthor && (
        <PostTimeline events={timeline} className="px-1" />
      )}

      <ItemFooter>
        <ItemActions>
          <Button
            variant={"like"}
            size={"icon"}
            className={"cursor-pointer"}
            onClick={() =>
              setPost((prev) => ({
                ...prev,
                isLiked: !prev.isLiked,
                likeCount: prev.isLiked
                  ? prev.likeCount - 1
                  : prev.likeCount + 1,
              }))
            }
          >
            <Heart
              className={cn(
                post.isLiked &&
                  "fill-destructive stroke-destructive dark:fill-destructive-foreground dark:stroke-destructive-foreground",
              )}
            />
          </Button>
          <span className="text-sm text-muted-foreground tabular-nums">
            {formatCount(post.likeCount)}
          </span>

          <Button
            variant={"comment"}
            size={"icon"}
            className={"cursor-pointer"}
            onClick={() => {
              if (onReply) {
                onReply();
              } else if (!disableComments) {
                navigate(`/${post.userId}/post/${post.id}`);
              }
            }}
          >
            <MessageSquare
              className={cn(
                disableComments &&
                  !onReply &&
                  "fill-sky-600 stroke-sky-600 dark:fill-sky-400 dark:stroke-sky-400",
              )}
            />
          </Button>
          <span className="text-sm text-muted-foreground tabular-nums">
            {formatCount(post.commentCount)}
          </span>
        </ItemActions>

        <span className="text-sm text-muted-foreground">
          {formatSmartDate(post.createdAt)}
        </span>
      </ItemFooter>
    </Item>
  );
};

export default Post;
