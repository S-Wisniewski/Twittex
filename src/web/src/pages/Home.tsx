import Post from "@/components/Post";
import { useInfiniteQuery } from "@tanstack/react-query";
import { postsApi } from "@/api/posts";
import { useAuth } from "@/contexts/AuthContext";
import { useEffect, useRef } from "react";
import { Loader2 } from "lucide-react";

const PAGE_SIZE = 15;

function Home() {
  const { currentUser } = useAuth();
  const sentinelRef = useRef<HTMLDivElement>(null);

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useInfiniteQuery({
      queryKey: ["feed"],
      queryFn: ({ pageParam }) => postsApi.getFeed(pageParam as number, PAGE_SIZE),
      initialPageParam: 1,
      getNextPageParam: (lastPage, allPages) =>
        lastPage.length === PAGE_SIZE ? allPages.length + 1 : undefined,
    });

  useEffect(() => {
    const el = sentinelRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting && hasNextPage) fetchNextPage(); },
      { rootMargin: "200px" },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [hasNextPage, fetchNextPage]);

  const posts = data?.pages.flat() ?? [];

  return (
    <div className="flex flex-col gap-4">
      {posts.map((post, index) => (
        <Post
          post={post}
          key={post.id + index}
          isAuthor={post.userId === currentUser?.id}
        />
      ))}

      <div ref={sentinelRef} className="flex justify-center py-4">
        {isFetchingNextPage && <Loader2 className="size-5 animate-spin text-muted-foreground" />}
      </div>
    </div>
  );
}

export default Home;
