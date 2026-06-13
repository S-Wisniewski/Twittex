import Post from "@/components/Post";
import { mockPost, type Post as PostType } from "@/types/Post";
import { useState } from "react";
import { Separator } from "@/components/ui/separator";
import { isoMinus } from "@/lib/utils";
import ComposePostDialog from "@/components/ComposePostDialog";
import { Button } from "@/components/ui/button";
import { MessageSquarePlus } from "lucide-react";
import { CURRENT_USER } from "@/lib/currentUser";

type CommentNode = PostType & { replies?: PostType[] };

const mockComments: CommentNode[] = [
  {
    ...mockPost,
    id: "c1",
    userName: "Alex Johnson",
    userId: "alexj",
    content: "Great post! Really got me thinking.",
    likeCount: 14,
    commentCount: 2,
    status: "Published",
    createdAt: isoMinus({ minutes: 45 }),
    replies: [
      {
        ...mockPost,
        id: "c1r1",
        userName: "Epstein",
        userId: "EpsteinIslandBoy",
        content: "Thanks, glad it resonated!",
        likeCount: 3,
        commentCount: 0,
        status: "Published",
        createdAt: isoMinus({ minutes: 30 }),
      },
      {
        ...mockPost,
        id: "c1r2",
        userName: "Maria Chen",
        userId: "mariachen",
        content: "Same here — especially the second point.",
        likeCount: 1,
        commentCount: 0,
        status: "Published",
        createdAt: isoMinus({ minutes: 20 }),
      },
    ],
  },
  {
    ...mockPost,
    id: "c2",
    userName: "Another User",
    userId: "anotheruser",
    content: "I disagree with some of this.",
    likeCount: 2,
    commentCount: 0,
    status: "Flagged",
    createdAt: isoMinus({ hours: 2 }),
    replies: [],
  },
  {
    ...mockPost,
    id: "c3",
    userName: "Jane Smith",
    userId: "janesmith",
    content: "Very interesting take, do you have sources?",
    likeCount: 8,
    commentCount: 1,
    status: "Published",
    createdAt: isoMinus({ hours: 3 }),
    replies: [
      {
        ...mockPost,
        id: "c3r1",
        userName: "Epstein",
        userId: "EpsteinIslandBoy",
        content: "Check the link in my bio!",
        likeCount: 2,
        commentCount: 0,
        status: "Published",
        createdAt: isoMinus({ hours: 2, minutes: 30 }),
      },
    ],
  },
];

// parentCommentId is always the top-level comment id (never a nested reply id)
type ReplyingTo = { parentCommentId: string; displayName: string } | null;

const CommentThread = ({
  comment,
  onReplyClick,
}: {
  comment: CommentNode;
  onReplyClick: (target: ReplyingTo) => void;
}) => {
  const isAuthor = comment.userId === CURRENT_USER.id;

  return (
    <div className="flex flex-col gap-2">
      <Post
        post={comment}
        disableComments
        isAuthor={isAuthor}
        onReply={() =>
          onReplyClick({ parentCommentId: comment.id, displayName: comment.userName })
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
                isAuthor={reply.userId === CURRENT_USER.id}
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
  const [comments, setComments] = useState<CommentNode[]>(mockComments);
  const [replyingTo, setReplyingTo] = useState<ReplyingTo>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  const handleReplyClick = (target: ReplyingTo) => {
    setReplyingTo(target);
    setDialogOpen(true);
  };

  const handleReply = (content: string) => {
    const newReply: PostType = {
      id: Date.now().toString(),
      userName: CURRENT_USER.name,
      userId: CURRENT_USER.id,
      userAvatarUrl: CURRENT_USER.avatarUrl,
      createdAt: new Date().toISOString(),
      content,
      isLiked: false,
      status: "Pending",
      likeCount: 0,
      commentCount: 0,
    };

    if (replyingTo) {
      setComments((prev) =>
        prev.map((c) =>
          c.id === replyingTo.parentCommentId
            ? { ...c, replies: [...(c.replies ?? []), newReply], commentCount: c.commentCount + 1 }
            : c,
        ),
      );
    } else {
      setComments((prev) => [{ ...newReply, replies: [] }, ...prev]);
    }

    setReplyingTo(null);
  };

  const isAuthorOfPost = mockPost.userId === CURRENT_USER.id;

  return (
    <div className="flex flex-col gap-4">
      <Post post={mockPost} disableComments isAuthor={isAuthorOfPost} />

      <div className="flex items-center justify-between">
        <span className="text-sm text-muted-foreground">
          {comments.length} {comments.length === 1 ? "comment" : "comments"}
        </span>
        <ComposePostDialog
          open={dialogOpen}
          onOpenChange={(o) => {
            setDialogOpen(o);
            if (!o) setReplyingTo(null);
          }}
          trigger={
            <Button variant="outline">
              <MessageSquarePlus />
              Reply
            </Button>
          }
          userName={CURRENT_USER.name}
          userAvatarUrl={CURRENT_USER.avatarUrl}
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
