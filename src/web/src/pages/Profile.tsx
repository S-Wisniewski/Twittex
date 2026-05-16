import { useState } from "react";
import { CalendarDaysIcon, CopyCheck } from "lucide-react";
import { useParams } from "react-router";

import UserAvatar from "@/components/UserAvatar";
import { formatDate } from "@/lib/utils";
import { Separator } from "@/components/ui/separator";
import Post from "@/components/Post";
import { Button } from "@/components/ui/button";
import { SmallDialog } from "@/components/Dialog";
import { mockProfile, type User } from "@/types/User";
import { mockPost, type Post as PostType } from "@/types/Post";
import { CURRENT_USER } from "@/lib/currentUser";
import { usePostStatus } from "@/hooks/usePostStatus";

// Mock own posts with varied statuses to demonstrate auto-refresh + timeline
const mockOwnPosts: PostType[] = [
  { ...mockPost, id: "own1", content: "Just posted this — waiting on review.", status: "Pending", likeCount: 0, commentCount: 0 },
  { ...mockPost, id: "own2", content: "This one made it through!", status: "Published", likeCount: 18, commentCount: 3 },
  { ...mockPost, id: "own3", content: "Apparently this was flagged by the community.", status: "Flagged", likeCount: 5, commentCount: 1 },
  { ...mockPost, id: "own4", content: "Under manual review right now.", status: "Review", likeCount: 2, commentCount: 0 },
  { ...mockPost, id: "own5", content: "This one got removed.", status: "Rejected", likeCount: 0, commentCount: 0 },
];

const mockOtherPosts = Array.from({ length: 5 }, (_, i) => ({
  ...mockPost,
  id: mockPost.id + i,
  status: "Published" as const,
}));

// Wrapper that applies auto-refresh to a single post card (for own active posts)
function LivePost({ post, isAuthor }: { post: PostType; isAuthor: boolean }) {
  const { status } = usePostStatus(post.id, post.status);
  return <Post post={{ ...post, status }} isAuthor={isAuthor} />;
}

const Profile = () => {
  const { userId } = useParams<{ userId: string }>();
  const isOwnProfile = !userId || userId === CURRENT_USER.id;

  const [copyUserId, setCopyUserId] = useState(false);
  const [user, setUser] = useState<User>(mockProfile);

  const posts = isOwnProfile ? mockOwnPosts : mockOtherPosts;

  const copyUserIdHandler = () => {
    if (!copyUserId) {
      navigator.clipboard.writeText(`@${user.userId}`);
      setCopyUserId(true);
      setTimeout(() => setCopyUserId(false), 4000);
    }
  };

  const handleFollow = () => {
    setUser((prev) => ({ ...prev, youFollow: !prev.youFollow }));
    // TODO: usersApi.follow / usersApi.unfollow
  };

  return (
    <div className="flex flex-col gap-8 p-8">
      <div className="flex items-center gap-4 justify-between">
        <div className="flex items-center gap-4">
          <UserAvatar
            size={"large"}
            url={user.userAvatarUrl}
            name={user.userName}
          />
          <div className="flex flex-col">
            <div className="flex flex-col">
              <span className="text-xl font-bold">{user.userName}</span>
              <div className="flex gap-2 items-center">
                <span
                  className={`text-sm text-muted-foreground ${!copyUserId && "cursor-copy"}`}
                  onClick={copyUserIdHandler}
                >
                  @{user.userId}
                </span>
                {copyUserId ? <CopyCheck size={"16"} /> : null}
              </div>
            </div>
            <div className="flex gap-2 items-center text-muted-foreground text-sm">
              <CalendarDaysIcon size={"16"} />
              <span>Joined {formatDate(user.createdAt)}</span>
            </div>
          </div>
        </div>

        <div className="flex flex-col items-center gap-4">
          <div className="flex gap-4 text-sm">
            <div className="flex gap-1">
              <span className="font-bold">{user.following}</span>
              <span className="text-muted-foreground">Following</span>
            </div>
            <div className="flex gap-1">
              <span className="font-bold">{user.followers}</span>
              <span className="text-muted-foreground">Followers</span>
            </div>
          </div>

          {isOwnProfile ? null : user.youFollow ? (
            <SmallDialog
              triggerButton={
                <Button variant={"secondary"} className={"w-full"}>
                  Following
                </Button>
              }
              title={`Unfollow ${user.userId}`}
              body={
                <UserAvatar
                  url={user.userAvatarUrl}
                  name={user.userId}
                  size={"medium"}
                />
              }
              secondButton={
                <Button variant={"destructive"} onClick={handleFollow}>
                  Unfollow
                </Button>
              }
            />
          ) : (
            <Button className={"w-full"} onClick={handleFollow}>
              Follow
            </Button>
          )}
        </div>
      </div>

      <Separator />

      {isOwnProfile && (
        <p className="text-sm text-muted-foreground -mb-4">
          Active posts auto-refresh every 5s until a terminal status is reached.
        </p>
      )}

      <div className="flex flex-col gap-4">
        {posts.map((post) =>
          isOwnProfile ? (
            <LivePost key={post.id} post={post} isAuthor />
          ) : (
            <Post key={post.id} post={post} />
          ),
        )}
      </div>
    </div>
  );
};

export default Profile;
