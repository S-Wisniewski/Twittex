import Post from "@/components/Post";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useParams } from "react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Separator } from "@/components/ui/separator";
import ComposePostDialog from "@/components/ComposePostDialog";
import { Button } from "@/components/ui/button";
import { MessageSquarePlus } from "lucide-react";
import { useAuth } from "@/contexts/useAuth";
import { useAuthGate } from "@/hooks/useAuthGate";
import { postsApi } from "@/api/posts";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import type { Post as PostType } from "@/types/Post";

const THREAD_LINE_X = 36;

const CommentThread = ({ comment }: { comment: PostType }) => {
  const { currentUser } = useAuth();
  return (
    <Post
      post={comment}
      isAuthor={comment.userId === currentUser?.id}
    />
  );
};

const PostPage = () => {
  const { t } = useTranslation();
  const { postId } = useParams<{ userName: string; postId: string }>();
  const { currentUser } = useAuth();
  const gate = useAuthGate();
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);

  const { data: post } = useQuery({
    queryKey: ["post", postId],
    queryFn: () => postsApi.getById(postId!),
    enabled: !!postId,
  });

  const { data: comments = [] } = useQuery({
    queryKey: ["comments", postId],
    queryFn: () => postsApi.getComments(postId!),
    enabled: !!postId,
  });

  const { data: ancestors = [] } = useQuery({
    queryKey: ["ancestors", postId],
    queryFn: () => postsApi.getAncestors(postId!),
    enabled: !!postId && !!post?.parentPostId,
  });

  const handleReply = (content: string) => {
    postsApi
      .create({ content, parentPostId: Number(postId) })
      .then(() => {
        queryClient.invalidateQueries({ queryKey: ["comments", postId] });
        queryClient.invalidateQueries({ queryKey: ["post", postId] });
      })
      .catch(() => toast.error(t("postPage.replyFailed")));
  };

  if (!post) {
    return (
      <div className="flex items-center justify-center p-16 text-sm text-muted-foreground">
        {t("common.loading")}
      </div>
    );
  }

  const isAuthorOfPost = post.userId === currentUser?.id;

  return (
    <div className="flex flex-col gap-4">
      {/* Ancestor thread chain */}
      <div className="flex flex-col">
        {ancestors.map((ancestor, i) => (
          <div key={ancestor.id} className="relative">
            {i !== 0 ? (
              <div
                className="absolute top-0 h-6 w-0.5 bg-border pointer-events-none z-10"
                style={{ left: THREAD_LINE_X }}
              />
            ) : null}
            <div
              className="absolute top-12 bottom-0 w-0.5 bg-border pointer-events-none"
              style={{ left: THREAD_LINE_X }}
            />
            <Post
              post={ancestor}
              threadIndent
              className={cn(
                i > 0 && "rounded-t-none border-t-0",
                "rounded-b-none",
              )}
            />
          </div>
        ))}
        <div className="relative">
          {ancestors.length > 0 && (
            <div
              className="absolute top-0 h-6 w-0.5 bg-border pointer-events-none z-10"
              style={{ left: THREAD_LINE_X }}
            />
          )}
          <Post
            post={post}
            disableComments
            isAuthor={isAuthorOfPost}
            className={
              ancestors.length > 0 ? "rounded-t-none border-t-0" : undefined
            }
          />
        </div>
      </div>

      <div className="flex items-center justify-between">
        <span className="text-sm text-muted-foreground">
          {t("postPage.comment", { count: comments.length })}
        </span>
        <ComposePostDialog
          open={dialogOpen}
          onOpenChange={(o) => {
            if (o) {
              gate(() => setDialogOpen(true));
              return;
            }
            setDialogOpen(false);
          }}
          trigger={
            <Button variant="outline">
              <MessageSquarePlus />
              {t("common.reply")}
            </Button>
          }
          userName={currentUser?.userName ?? ""}
          userAvatarUrl={currentUser?.userAvatarUrl ?? ""}
          replyingTo={post.userName}
          onSubmit={handleReply}
        />
      </div>

      <Separator />

      <div className="flex flex-col gap-6">
        {comments.map((comment) => (
          <CommentThread key={comment.id} comment={comment} />
        ))}
      </div>
    </div>
  );
};

export default PostPage;
