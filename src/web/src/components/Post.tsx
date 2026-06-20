import { Bookmark, Flag, Heart, Link2, MessageSquare, Trash2 } from "lucide-react";
import {
  Item,
  ItemActions,
  ItemContent,
  ItemFooter,
  ItemHeader,
} from "./ui/item";
import { Button } from "./ui/button";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useRelativeTime } from "@/hooks/useRelativeTime";
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
  isBookmarked: boolean;
  status: PostStatus;
  likeCount: number;
  commentCount: number;
};

const STATUS_CLASSNAMES: Partial<Record<PostStatus, string>> = {
  Pending: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
  Flagged: "bg-orange-500/10 text-orange-600 dark:text-orange-400",
  Rejected: "bg-destructive/10 text-destructive dark:text-destructive-foreground",
  Error: "bg-muted text-muted-foreground",
};

const STATUS_LABEL_KEY: Partial<Record<PostStatus, string>> = {
  Pending: "post.statusPending",
  Flagged: "post.statusFlagged",
  Rejected: "post.statusRejected",
  Error: "post.statusError",
};

const REVIEW_TYPE_KEYS: Record<ReviewType, string> = {
  InappropriateContent: "post.reportReasons.inappropriate",
  Spam: "post.reportReasons.spam",
  Harassment: "post.reportReasons.harassment",
  HateSpeech: "post.reportReasons.hate",
  Misinformation: "post.reportReasons.misinfo",
  Other: "post.reportReasons.other",
};

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
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const gate = useAuthGate();
  const queryClient = useQueryClient();
  const post = camePost;
  const [isLiked, setIsLiked] = useState(camePost.isLiked);
  const [likeCount, setLikeCount] = useState(camePost.likeCount);
  const [isBookmarked, setIsBookmarked] = useState(camePost.isBookmarked);
  const relativeTime = useRelativeTime(post.createdAt);

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
      queryClient.setQueriesData<PostType[]>(
        { queryKey: ["posts", "user"] },
        (old) => old?.filter((p) => p.id !== post.id),
      );
      queryClient.setQueriesData<ReplyThread[]>(
        { queryKey: ["replies", "user"] },
        (old) => old?.filter((t) => t.reply.id !== post.id),
      );
      queryClient.setQueriesData<PostType[]>(
        { queryKey: ["comments"] },
        (old) => old?.filter((p) => p.id !== post.id),
      );
      toast.success(t("post.toasts.deleted"));
    },
    onError: () => toast.error(t("post.toasts.deleteFailed")),
  });

  const [reportOpen, setReportOpen] = useState(false);
  const [reportType, setReportType] = useState<ReviewType>("InappropriateContent");
  const [reportDescription, setReportDescription] = useState("");

  const handleReport = () => {
    reportsApi
      .create(post.id, {
        reason: reportType,
        description: reportDescription || undefined,
      })
      .then(() => {
        toast.success(t("post.toasts.reported"), {
          description: t("post.toasts.reportedDesc", { type: t(REVIEW_TYPE_KEYS[reportType]) }),
        });
      })
      .catch(() => {
        toast.error(t("post.toasts.reportFailed"));
      });
    setReportOpen(false);
    setReportDescription("");
  };

  const statusClassName = STATUS_CLASSNAMES[post.status];
  const statusLabelKey = STATUS_LABEL_KEY[post.status];

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
                <DialogTitle className="text-center">{t("post.deleteTitle")}</DialogTitle>
                <DialogDescription className="text-center">
                  {t("post.deleteBody")}
                </DialogDescription>
              </DialogHeader>
              <DialogFooter className="flex items-center justify-center! gap-4">
                <DialogClose render={<Button variant="outline">{t("common.cancel")}</Button>} />
                <Button
                  variant="destructive"
                  disabled={deleteMutation.isPending}
                  onClick={() => deleteMutation.mutate()}
                >
                  {t("common.delete")}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}

        {!isAuthor && !!currentUser && (
          <Dialog open={reportOpen} onOpenChange={setReportOpen}>
            <div className="flex">
              {statusClassName && statusLabelKey && (
                <div
                  className={cn(
                    "flex items-center rounded-lg px-3 py-1.5 text-xs font-medium w-fit",
                    statusClassName,
                  )}
                >
                  {t(statusLabelKey)}
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
                  {t("post.reportTitle")}
                </DialogTitle>
                <DialogDescription className="text-center">
                  {t("post.reportBody")}
                </DialogDescription>
              </DialogHeader>

              <div className="flex flex-col gap-3">
                <select
                  value={reportType}
                  onChange={(e) => setReportType(e.target.value as ReviewType)}
                  className="w-full rounded-xl border border-input bg-input/30 px-3 py-2 text-sm outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 transition-colors"
                >
                  {(Object.keys(REVIEW_TYPE_KEYS) as ReviewType[]).map((key) => (
                    <option key={key} value={key}>
                      {t(REVIEW_TYPE_KEYS[key])}
                    </option>
                  ))}
                </select>

                <Textarea
                  placeholder={t("post.reportDetailsPlaceholder")}
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
                  render={<Button variant="outline">{t("common.cancel")}</Button>}
                />
                <Button variant={"destructive"} onClick={handleReport}>
                  {t("post.report")}
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

          <Button
            variant="ghost"
            size="icon"
            className="cursor-pointer text-muted-foreground ml-1"
            onClick={() => {
              const url = `${window.location.origin}/${post.userName}/post/${post.id}`;
              const copy = navigator.clipboard?.writeText(url) ?? Promise.reject();
              copy
                .then(() => toast.success(t("post.toasts.linkCopied")))
                .catch(() => {
                  const el = document.createElement("textarea");
                  el.value = url;
                  el.style.cssText = "position:fixed;opacity:0";
                  document.body.appendChild(el);
                  el.select();
                  document.execCommand("copy");
                  document.body.removeChild(el);
                  toast.success(t("post.toasts.linkCopied"));
                });
            }}
          >
            <Link2 className="size-4" />
          </Button>

          <Button
            variant="ghost"
            size="icon"
            className="cursor-pointer text-muted-foreground ml-1"
            onClick={() =>
              gate(() => {
                const wasBookmarked = isBookmarked;
                setIsBookmarked(!isBookmarked);
                (wasBookmarked ? postsApi.unbookmark : postsApi.bookmark)(post.id).then(() => {
                  queryClient.invalidateQueries({ queryKey: ["bookmarks", "me"] });
                }).catch(() => {
                  setIsBookmarked(wasBookmarked);
                });
              })
            }
          >
            <Bookmark
              className={cn(
                "size-4",
                isBookmarked && "fill-amber-500 stroke-amber-500 dark:fill-amber-400 dark:stroke-amber-400",
              )}
            />
          </Button>
        </ItemActions>

        <span className="text-sm text-muted-foreground">
          {relativeTime}
        </span>
      </ItemFooter>
    </Item>
  );
};

export default Post;
