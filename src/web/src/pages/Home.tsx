import Post from "@/components/Post";
import { mockPost, type Post as PostType } from "@/types/Post";
import { useState } from "react";
import { CURRENT_USER } from "@/lib/currentUser";

const mockPosts = Array.from({ length: 10 }, (_, i) => ({
  ...mockPost,
  id: mockPost.id + i,
}));

function Home() {
  const [posts] = useState<PostType[]>(mockPosts);

  return (
    <div className="flex flex-col gap-4">
      {posts.map((post, index) => (
        <Post
          post={post}
          key={post.id + index}
          isAuthor={post.userId === CURRENT_USER.id}
        />
      ))}
    </div>
  );
}

export default Home;
