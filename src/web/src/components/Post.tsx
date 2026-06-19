import { Flag, Heart, MessageSquare, Trash2 } from "lucide-react";
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
import { useAuth } from "@/contexts/useAuth";
import { useAuthGate } from "@/hooks/useAuthGate";
import { cn } from "@/lib/utils";
import { postsApi } from "@/api/posts";
import { reportsApi } from "@/api/reports";
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
import PostTimeline from "./PostTimeline";
import { useQuery, useMutation, useQueryClient, type InfiniteData } from "@tanstack/react-query";
import type { Post as PostType, ReplyThread, PostStatus, ReviewType } from "@/types/Post";

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
    label: "Pending automated review",
    className: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
  },
  Flagged: {
    label: "Reported by the community — pending re-review",
    className: "bg-orange-500/10 text-orange-600 dark:text-orange-400",
  },
  Review: null,
  Rejected: {
    label: "Removed — policy violation",
    className: "bg-destructive/10 text-destructive dark:text-destructive-foreground",
  },
  Error: {
    label: "Moderation error — will be reviewed",
    className: "bg-muted text-muted-foreground",
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
  className,
  threadIndent = false,
}: {
  post: PostProps;
  disableComments?: boolean;
  isAuthor?: boolean;
  onReply?: () => void;
  className?: string;
  threadIndent?: boolean;
}) => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const gate = useAuthGate();
  const queryClient = useQueryClient();
  const post = camePost;
  const [isLiked, setIsLiked] = useState(camePost.isLiked);
  const [likeCount, setLikeCount] = useState(camePost.likeCount);

  const [deleteOpen, setDeleteOpen] = useState(false);
  const deleteMutation = useMutation({
    mutationFn: () => postsApi.delete(post.id),
    onSuccess: () => {
      setDeleteOpen(false);
      queryClient.setQueriesData<InfiniteData<PostType[]>>(
        { queryKey: ["feed"] },
        (old) => old && {
          ...old,
          pages: old.pages.map((page) => page.filter((p) => p.id !== post.id)),
        },
      );
      // Profile posts tab
      queryClient.setQueriesData<PostType[]>(
        { queryKey: ["posts", "user"] },
        (old) => old?.filter((p) => p.id !== post.id),
      );
      // Profile replies tab — ReplyThread[] keyed by ["replies", "user", userId]
      queryClient.setQueriesData<ReplyThread[]>(
        { queryKey: ["replies", "user"] },
        (old) => old?.filter((t) => t.reply.id !== post.id),
      );
      // PostPage comments — Post[] keyed by ["comments", postId]
      queryClient.setQueriesData<PostType[]>(
        { queryKey: ["comments"] },
        (old) => old?.filter((p) => p.id !== post.id),
      );
      toast.success("Post deleted");
    },
    onError: () => toast.error("Failed to delete post. Please try again."),
  });

  const [reportOpen, setReportOpen] = useState(false);
  const [reportType, setReportType] = useState<ReviewType>(
    "InappropriateContent",
  );
  const [reportDescription, setReportDescription] = useState("");

  const handleReport = () => {
    reportsApi
      .create(post.id, {
        reason: reportType,
        description: reportDescription || undefined,
      })
      .then(() => {
        toast.success("Post reported", {
          description: `Reason: ${REVIEW_TYPE_LABELS[reportType]}. Our team will review it shortly.`,
        });
      })
      .catch(() => {
        toast.error("Failed to submit report. Please try again.");
      });
    setReportOpen(false);
    setReportDescription("");
  };

  const statusConfig = STATUS_CONFIG[post.status];

  const { data: logs = [] } = useQuery({
    queryKey: ["posts", post.id, "logs"],
    queryFn: () => postsApi.getLogs(post.id),
    enabled: isAuthor && post.status !== "Published",
  });

  return (
    <Item variant={"outline"} className={cn("gap-2", className)}>
      <ItemHeader className="mb-2">
        <div className="flex gap-4 items-center">
          <UserAvatar url={post.userAvatarUrl} name={post.userName} />
          <div className="flex flex-col">
            <span
              className="hover:underline hover:cursor-pointer"
              onClick={() => navigate(`/${post.userName}`)}
            >
              {post.userName}
            </span>
            <span className="text-sm text-muted-foreground">
              @{post.userName}
            </span>
          </div>
        </div>

        {isAuthor && (
          <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
            <DialogTrigger
              render={
                <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-destructive">
                  <Trash2 className="size-4" />
                </Button>
              }
            />
            <DialogContent showCloseButton={false}>
              <DialogHeader>
                <DialogTitle className="text-center">Delete post?</DialogTitle>
                <DialogDescription className="text-center">
                  This action cannot be undone.
                </DialogDescription>
              </DialogHeader>
              <DialogFooter className="flex items-center justify-center! gap-4">
                <DialogClose render={<Button variant="outline">Cancel</Button>} />
                <Button
                  variant="destructive"
                  disabled={deleteMutation.isPending}
                  onClick={() => deleteMutation.mutate()}
                >
                  Delete
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}

        {!isAuthor && !!currentUser && (
          <Dialog open={reportOpen} onOpenChange={setReportOpen}>
            <div className="flex">
              {statusConfig && (
                <div
                  className={cn(
                    "flex items-center rounded-lg px-3 py-1.5 text-xs font-medium w-fit",
                    statusConfig.className,
                  )}
                >
                  {statusConfig.label}
                </div>
              )}
              <DialogTrigger
                render={
                  <Button variant={"link"} size={"icon"}>
                    <Flag />
                  </Button>
                }
              />
            </div>
            <DialogContent showCloseButton={false}>
              <DialogHeader>
                <DialogTitle className="text-center">
                  Report this post
                </DialogTitle>
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
                <DialogClose
                  render={<Button variant="outline">Cancel</Button>}
                />
                <Button variant={"destructive"} onClick={handleReport}>
                  Report
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </ItemHeader>

      <ItemContent className={threadIndent ? "pl-14" : undefined}>
        {post.content}
      </ItemContent>

      {isAuthor && logs.length > 0 && <PostTimeline events={logs} className="px-1" />}

      <ItemFooter>
        <ItemActions className={threadIndent ? "pl-12" : undefined}>
          <Button
            variant={"like"}
            size={"icon"}
            className={"cursor-pointer"}
            onClick={() =>
              gate(() => {
                const wasLiked = isLiked;
                setIsLiked(!isLiked);
                setLikeCount((c) => (isLiked ? c - 1 : c + 1));
                (wasLiked ? postsApi.unlike : postsApi.like)(post.id).catch(() => {
                  setIsLiked(wasLiked);
                  setLikeCount((c) => (wasLiked ? c + 1 : c - 1));
                });
              })
            }
          >
            <Heart
              className={cn(
                isLiked &&
                  "fill-destructive stroke-destructive dark:fill-destructive-foreground dark:stroke-destructive-foreground",
              )}
            />
          </Button>
          <span className="text-sm text-muted-foreground tabular-nums">
            {formatCount(likeCount)}
          </span>

          <Button
            variant={"comment"}
            size={"icon"}
            className={"cursor-pointer"}
            onClick={() => {
              if (onReply) {
                gate(() => onReply());
              } else if (!disableComments) {
                navigate(`/${post.userName}/post/${post.id}`);
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
