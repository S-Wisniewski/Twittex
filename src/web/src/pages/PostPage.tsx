import Post from "@/components/Post";
import { useState } from "react";
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

type CommentNode = PostType & { replies?: PostType[] };

type ReplyingTo = { parentCommentId: string; displayName: string } | null;

const CommentThread = ({
  comment,
  onReplyClick,
}: {
  comment: CommentNode;
  onReplyClick: (target: ReplyingTo) => void;
}) => {
  const { currentUser } = useAuth();
  const isAuthor = comment.userId === currentUser?.id;

  return (
    <div className="flex flex-col gap-2">
      <Post
        post={comment}
        disableComments
        isAuthor={isAuthor}
        onReply={() =>
          onReplyClick({
            parentCommentId: comment.id,
            displayName: comment.userName,
          })
        }
      />

      {comment.replies && comment.replies.length > 0 && (
        <div className="flex gap-3 pl-4">
          <div className="w-px bg-border shrink-0 rounded-full" />
          <div className="flex flex-col gap-2 flex-1">
            {comment.replies.map((reply) => (
              <Post
                key={reply.id}
                post={reply}
                disableComments
                isAuthor={reply.userId === currentUser?.id}
                onReply={() =>
                  onReplyClick({
                    parentCommentId: comment.id,
                    displayName: reply.userName,
                  })
                }
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

const PostPage = () => {
  const { postId } = useParams<{ userName: string; postId: string }>();
  const { currentUser } = useAuth();
  const gate = useAuthGate();
  const queryClient = useQueryClient();
  const [replyingTo, setReplyingTo] = useState<ReplyingTo>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  const { data: post } = useQuery({
    queryKey: ["post", postId],
    queryFn: () => postsApi.getById(postId!),
    enabled: !!postId,
  });

  const { data: serverComments = [] } = useQuery({
    queryKey: ["comments", postId],
    queryFn: () => postsApi.getComments(postId!),
    enabled: !!postId,
  });

  const { data: ancestors = [] } = useQuery({
    queryKey: ["ancestors", postId],
    queryFn: () => postsApi.getAncestors(postId!),
    enabled: !!postId && !!post?.parentPostId,
  });

  const comments: CommentNode[] = serverComments.map((c) => ({
    ...c,
    replies: [],
  }));

  const handleReplyClick = (target: ReplyingTo) => {
    setReplyingTo(target);
    setDialogOpen(true);
  };

  const handleReply = (content: string) => {
    postsApi
      .create({
        content,
        parentPostId: Number(replyingTo?.parentCommentId ?? postId),
      })
      .then(() => {
        queryClient.invalidateQueries({ queryKey: ["comments", postId] });
        queryClient.invalidateQueries({ queryKey: ["post", postId] });
      })
      .catch(() => toast.error("Failed to post reply."));
    setReplyingTo(null);
  };

  if (!post) {
    return (
      <div className="flex items-center justify-center p-16 text-sm text-muted-foreground">
        Loading…
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
          {comments.length} {comments.length === 1 ? "comment" : "comments"}
        </span>
        <ComposePostDialog
          open={dialogOpen}
          onOpenChange={(o) => {
            if (o) {
              gate(() => setDialogOpen(true));
              return;
            }
            setDialogOpen(false);
            setReplyingTo(null);
          }}
          trigger={
            <Button variant="outline">
              <MessageSquarePlus />
              Reply
            </Button>
          }
          userName={currentUser?.userName ?? ""}
          userAvatarUrl={currentUser?.userAvatarUrl ?? ""}
          replyingTo={replyingTo?.displayName}
          onSubmit={handleReply}
        />
      </div>

      <Separator />

      <div className="flex flex-col gap-6">
        {comments.map((comment) => (
          <CommentThread
            key={comment.id}
            comment={comment}
            onReplyClick={handleReplyClick}
          />
        ))}
      </div>
    </div>
  );
};

export default PostPage;
