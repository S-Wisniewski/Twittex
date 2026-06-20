import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router";
import { useTranslation } from "react-i18next";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import UserAvatar from "@/components/UserAvatar";
import { usersApi } from "@/api/users";
import type { User } from "@/types/User";

type Props = {
  userId: string;
  defaultTab: "followers" | "following" | null;
  onClose: () => void;
};

function UserList({ users, isLoading, empty, onClose }: {
  users: User[];
  isLoading: boolean;
  empty: string;
  onClose: () => void;
}) {
  const { t } = useTranslation();
  if (isLoading) return <p className="text-sm text-muted-foreground text-center py-8">{t("common.loading")}</p>;
  if (users.length === 0) return <p className="text-sm text-muted-foreground text-center py-8">{empty}</p>;
  return (
    <ul className="divide-y">
      {users.map((user) => (
        <li key={user.id}>
          <Link
            to={`/${user.userName}`}
            onClick={onClose}
            className="flex items-center gap-3 px-5 py-3 hover:bg-muted/50 transition-colors"
          >
            <UserAvatar url={user.userAvatarUrl} name={user.userName} size="small" />
            <div className="flex flex-col min-w-0">
              <span className="text-sm font-medium truncate">{user.userName}</span>
              {user.content && (
                <span className="text-xs text-muted-foreground truncate">{user.content}</span>
              )}
            </div>
          </Link>
        </li>
      ))}
    </ul>
  );
}

const FollowListDialog = ({ userId, defaultTab, onClose }: Props) => {
  const { t } = useTranslation();

  const { data: followers = [], isLoading: loadingFollowers } = useQuery({
    queryKey: ["users", userId, "followers"],
    queryFn: () => usersApi.getFollowers(userId),
    enabled: !!defaultTab,
  });

  const { data: following = [], isLoading: loadingFollowing } = useQuery({
    queryKey: ["users", userId, "following"],
    queryFn: () => usersApi.getFollowing(userId),
    enabled: !!defaultTab,
  });

  return (
    <Dialog open={!!defaultTab} onOpenChange={(o) => { if (!o) onClose(); }}>
      <DialogContent className="max-w-sm p-0 overflow-hidden">
        <DialogHeader className="px-5 pt-5 pb-0">
          <DialogTitle>{t("followList.title")}</DialogTitle>
        </DialogHeader>

        <Tabs defaultValue={defaultTab ?? "followers"} key={defaultTab ?? ""}>
          <TabsList variant="line" className="w-full justify-start px-5 border-b pb-0">
            <TabsTrigger value="following">{t("common.following")}</TabsTrigger>
            <TabsTrigger value="followers">{t("common.followers")}</TabsTrigger>
          </TabsList>

          <div className="h-80 overflow-y-auto">
            <TabsContent value="following" className="mt-0">
              <UserList users={following} isLoading={loadingFollowing} empty={t("followList.emptyFollowing")} onClose={onClose} />
            </TabsContent>
            <TabsContent value="followers" className="mt-0">
              <UserList users={followers} isLoading={loadingFollowers} empty={t("followList.emptyFollowers")} onClose={onClose} />
            </TabsContent>
          </div>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default FollowListDialog;
