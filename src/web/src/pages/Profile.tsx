import { useState } from "react";
import { useTranslation } from "react-i18next";
import { CalendarDaysIcon, CopyCheck } from "lucide-react";
import { useParams } from "react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

import UserAvatar from "@/components/UserAvatar";
import { formatDate } from "@/lib/utils";
import { Separator } from "@/components/ui/separator";
import Post from "@/components/Post";
import { Button } from "@/components/ui/button";
import { SmallDialog } from "@/components/Dialog";
import { useAuth } from "@/contexts/useAuth";
import { useAuthGate } from "@/hooks/useAuthGate";
import { usePostStatus } from "@/hooks/usePostStatus";
import { usersApi } from "@/api/users";
import { postsApi } from "@/api/posts";
import { ReplyThreadView } from "@/components/ReplyThreadView";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import FollowListDialog from "@/components/FollowListDialog";
import type { Post as PostType } from "@/types/Post";
import type { User } from "@/types/User";

function LivePost({ post, isAuthor }: { post: PostType; isAuthor: boolean }) {
  const { status } = usePostStatus(post.id, post.status);
  return <Post post={{ ...post, status }} isAuthor={isAuthor} />;
}

const Profile = () => {
  const { t } = useTranslation();
  const { userName } = useParams<{ userName: string }>();
  const { currentUser } = useAuth();
  const gate = useAuthGate();
  const queryClient = useQueryClient();
  const isOwnProfile = !userName || userName === currentUser?.userName;
  const target = userName || currentUser?.userName;

  const [copyHandle, setCopyHandle] = useState(false);
  const [followList, setFollowList] = useState<"followers" | "following" | null>(null);

  const { data: user } = useQuery({
    queryKey: ["user", target],
    queryFn: () => usersApi.getById(target!),
    enabled: !!target,
  });

  const { data: posts = [] } = useQuery({
    queryKey: ["posts", "user", user?.id],
    queryFn: () => postsApi.getByUser(user!.id),
    enabled: !!user?.id,
  });

  const { data: replyThreads = [] } = useQuery({
    queryKey: ["replies", "user", user?.id],
    queryFn: () => postsApi.getRepliesByUser(user!.id),
    enabled: !!user?.id,
  });

  const { data: bookmarks = [] } = useQuery({
    queryKey: ["bookmarks", "me"],
    queryFn: () => postsApi.getMyBookmarks(),
    enabled: isOwnProfile,
  });

  const followMutation = useMutation({
    mutationFn: () =>
      user!.youFollow ? usersApi.unfollow(user!.id) : usersApi.follow(user!.id),
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: ["user", target] });
      const prev = queryClient.getQueryData<User>(["user", target]);
      queryClient.setQueryData<User>(["user", target], (old) =>
        old
          ? {
              ...old,
              youFollow: !old.youFollow,
              followers: old.youFollow ? old.followers - 1 : old.followers + 1,
            }
          : old,
      );
      return { prev };
    },
    onError: (_err, _v, ctx) => {
      if (ctx?.prev) queryClient.setQueryData(["user", target], ctx.prev);
    },
  });

  const copyHandleHandler = () => {
    if (!copyHandle && user) {
      navigator.clipboard.writeText(`@${user.userName}`);
      setCopyHandle(true);
      setTimeout(() => setCopyHandle(false), 4000);
    }
  };

  const handleFollow = () => {
    gate(() => followMutation.mutate());
  };

  if (!user) {
    return (
      <div className="flex flex-col gap-8 p-8">
        <p className="text-sm text-muted-foreground">{t("profile.loadingProfile")}</p>
      </div>
    );
  }

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
                  className={`text-sm text-muted-foreground ${!copyHandle && "cursor-copy"}`}
                  onClick={copyHandleHandler}
                >
                  @{user.userName}
                </span>
                {copyHandle ? <CopyCheck size={"16"} /> : null}
              </div>
            </div>
            <div className="flex gap-2 items-center text-muted-foreground text-sm">
              <CalendarDaysIcon size={"16"} />
              <span>{t("profile.joined", { date: formatDate(user.createdAt) })}</span>
            </div>
            {user.content && (
              <p className="text-sm text-muted-foreground mt-1 max-w-sm">{user.content}</p>
            )}
          </div>
        </div>

        <div className="flex flex-col items-center gap-4">
          <div className="flex gap-4 text-sm">
            <button
              className="flex gap-1 hover:underline cursor-pointer"
              onClick={() => setFollowList("following")}
            >
              <span className="font-bold">{user.following}</span>
              <span className="text-muted-foreground">{t("common.following")}</span>
            </button>
            <button
              className="flex gap-1 hover:underline cursor-pointer"
              onClick={() => setFollowList("followers")}
            >
              <span className="font-bold">{user.followers}</span>
              <span className="text-muted-foreground">{t("common.followers")}</span>
            </button>
          </div>

          {isOwnProfile ? null : user.youFollow ? (
            <SmallDialog
              triggerButton={
                <Button variant={"secondary"} className={"w-full"}>
                  {t("common.following")}
                </Button>
              }
              title={t("profile.unfollow", { userName: user.userName })}
              body={
                <UserAvatar
                  url={user.userAvatarUrl}
                  name={user.userName}
                  size={"medium"}
                />
              }
              secondButton={
                <Button variant={"destructive"} onClick={handleFollow}>
                  {t("common.unfollow")}
                </Button>
              }
            />
          ) : (
            <Button className={"w-full"} onClick={handleFollow}>
              {t("common.follow")}
            </Button>
          )}
        </div>
      </div>

      <FollowListDialog
        userId={user.id}
        defaultTab={followList}
        onClose={() => setFollowList(null)}
      />

      <Separator />

      <Tabs defaultValue="posts">
        <TabsList className="w-full bg-transparent p-0 gap-2">
          <TabsTrigger
            value="posts"
            className="flex-1 rounded-full border border-border data-active:bg-primary data-active:text-primary-foreground data-active:border-primary"
          >
            {t("profile.posts")}
          </TabsTrigger>
          <TabsTrigger
            value="replies"
            className="flex-1 rounded-full border border-border data-active:bg-primary data-active:text-primary-foreground data-active:border-primary"
          >
            {t("profile.replies")}
          </TabsTrigger>
          {isOwnProfile && (
            <TabsTrigger
              value="bookmarks"
              className="flex-1 rounded-full border border-border data-active:bg-primary data-active:text-primary-foreground data-active:border-primary"
            >
              {t("profile.bookmarks")}
            </TabsTrigger>
          )}
        </TabsList>

        <TabsContent value="posts">
          {isOwnProfile && posts.length > 0 && (
            <p className="text-sm text-muted-foreground mb-4">
              {t("profile.autoRefresh")}
            </p>
          )}
          <div className="flex flex-col gap-4 mt-4">
            {posts.map((post) =>
              isOwnProfile ? (
                <LivePost key={post.id} post={post} isAuthor />
              ) : (
                <Post key={post.id} post={post} />
              ),
            )}
          </div>
        </TabsContent>

        <TabsContent value="replies">
          <div className="flex flex-col gap-4 mt-4">
            {replyThreads.map((thread) => (
              <ReplyThreadView
                key={thread.reply.id}
                thread={thread}
                isOwnProfile={isOwnProfile}
              />
            ))}
            {replyThreads.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-8">
                {t("profile.noReplies")}
              </p>
            )}
          </div>
        </TabsContent>

        {isOwnProfile && (
          <TabsContent value="bookmarks">
            <div className="flex flex-col gap-4 mt-4">
              {bookmarks.map((post) => (
                <Post key={post.id} post={post} isAuthor />
              ))}
              {bookmarks.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-8">
                  {t("profile.noBookmarks")}
                </p>
              )}
            </div>
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
};

export default Profile;
