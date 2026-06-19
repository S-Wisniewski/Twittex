import Post from "./Post";
import { usePostStatus } from "@/hooks/usePostStatus";
import { cn } from "@/lib/utils";
import type { Post as PostType, ReplyThread } from "@/types/Post";

// Left position of the thread indicator line inside the card's left padding (px-4 = 16px).
// Keeps the line well clear of all text content.
const THREAD_LINE_X = 36;

function LiveReply({
  post,
  isAuthor,
  className,
}: {
  post: PostType;
  isAuthor: boolean;
  className?: string;
}) {
  const { status } = usePostStatus(post.id, post.status);
  return (
    <Post
      post={{ ...post, status }}
      isAuthor={isAuthor}
      className={className}
    />
  );
}

type Props = {
  thread: ReplyThread;
  isOwnProfile: boolean;
};

export function ReplyThreadView({ thread, isOwnProfile }: Props) {
  const hasAncestors = thread.ancestors.length > 0;

  return (
    <div className="flex flex-col">
      {thread.ancestors.map((ancestor, i) => (
        <div key={ancestor.id} className="relative">
          {i !== 0 ? (
            <div
              className="absolute top-0 h-6 w-0.5 bg-border pointer-events-none"
              style={{ left: THREAD_LINE_X }}
            />
          ) : null}
          {/* Side indicator line — runs the full height of this card */}
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
        {/* Short line entering the reply card from the top */}
        {hasAncestors && (
          <div
            className="absolute top-0 h-6 w-0.5 bg-border pointer-events-none"
            style={{ left: THREAD_LINE_X }}
          />
        )}
        {isOwnProfile ? (
          <LiveReply
            post={thread.reply}
            isAuthor
            className={hasAncestors ? "rounded-t-none border-t-0" : undefined}
          />
        ) : (
          <Post
            post={thread.reply}
            className={hasAncestors ? "rounded-t-none border-t-0" : undefined}
          />
        )}
      </div>
    </div>
  );
}
