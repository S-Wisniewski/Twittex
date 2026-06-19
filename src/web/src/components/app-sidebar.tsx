import * as React from "react";
import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { Bell, Home, LogOut, Pencil, Search, Settings as SettingsIcon } from "lucide-react";
import { useMutation, useQueryClient, type InfiniteData } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { postsApi } from "@/api/posts";
import type { Post } from "@/types/Post";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { Button } from "./ui/button";
import UserAvatar from "./UserAvatar";
import ComposePostDialog from "./ComposePostDialog";
import SearchModal from "./SearchModal";
import Settings from "./Settings";
import NotificationsSheet from "./NotificationsSheet";
import { useAuth } from "@/contexts/useAuth";
import { toast } from "sonner";

export const AppSidebar = ({
  ...props
}: React.ComponentProps<typeof Sidebar>) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { currentUser, isLoading, logout } = useAuth();
  const queryClient = useQueryClient();

  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const createPostMutation = useMutation({
    mutationFn: (content: string) => postsApi.create({ content }),
    onSuccess: (newPost) => {
      queryClient.setQueriesData<InfiniteData<Post[]>>(
        { queryKey: ["feed"] },
        (old) => {
          if (!old) return old;
          return { ...old, pages: [[newPost, ...old.pages[0]], ...old.pages.slice(1)] };
        },
      );
      queryClient.invalidateQueries({ queryKey: ["feed"] });
      toast.success(t("sidebar.toasts.postSubmitted"), { description: t("sidebar.toasts.postPending") });
      navigate("/");
    },
    onError: () => toast.error(t("sidebar.toasts.postFailed")),
  });

  const handleNewPost = (content: string) => {
    createPostMutation.mutate(content);
  };

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  return (
    <Sidebar variant="inset" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              size="lg"
              render={(props) => (
                <Link {...props} to="/">
                  <div className="flex aspect-square size-10 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                    <img src="/Twittex.svg" alt="logo" />
                  </div>
                  <div className="flex flex-col gap-0.5 leading-none">
                    <span className="font-medium">Twittex</span>
                    <span className="text-xs text-muted-foreground">v1.0.0</span>
                  </div>
                </Link>
              )}
            />
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarMenu className="gap-1">
            <SidebarMenuItem>
              <SidebarMenuButton onClick={() => navigate("/", { replace: true })}>
                <Home />
                <span>{t("sidebar.home")}</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton onClick={() => setIsSearchOpen(true)}>
                <Search />
                <span>{t("sidebar.search")}</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroup>

        {currentUser && (
          <SidebarGroup>
            <ComposePostDialog
              trigger={
                <Button className="w-full gap-2">
                  <Pencil />
                  {t("sidebar.newPost")}
                </Button>
              }
              userName={currentUser.userName}
              userAvatarUrl={currentUser.userAvatarUrl}
              onSubmit={handleNewPost}
            />
          </SidebarGroup>
        )}

        <SidebarGroup className="mt-auto">
          <SidebarMenu className="gap-1">
            <SidebarMenuItem>
              <SidebarMenuButton onClick={() => currentUser ? setIsNotificationsOpen(true) : navigate("/login")}>
                <Bell />
                <span>{t("sidebar.notifications")}</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton onClick={() => currentUser ? setIsSettingsOpen(true) : navigate("/login")}>
                <SettingsIcon />
                <span>{t("sidebar.settings")}</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        {!isLoading && (
          currentUser ? (
            <div className="flex items-center gap-2 px-1 py-1">
              <button
                onClick={() => navigate(`/${currentUser.userName}`)}
                className="flex flex-1 items-center gap-3 min-w-0 rounded-lg p-2 text-left transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
              >
                <UserAvatar url={currentUser.userAvatarUrl} name={currentUser.userName} />
                <div className="flex flex-col min-w-0">
                  <span className="truncate text-sm font-medium leading-tight">
                    {currentUser.userName}
                  </span>
                  <span className="truncate text-xs text-muted-foreground leading-tight">
                    @{currentUser.userName}
                  </span>
                </div>
              </button>

              <Button
                variant="ghost"
                size="icon-sm"
                className="shrink-0 text-destructive hover:text-destructive hover:bg-destructive/10"
                onClick={handleLogout}
                title={t("navUser.logOut")}
              >
                <LogOut className="size-4" />
              </Button>
            </div>
          ) : (
            <div className="flex flex-col gap-2 p-2">
              <Button className="w-full" onClick={() => navigate("/login")}>
                {t("sidebar.signIn")}
              </Button>
              <Button variant="outline" className="w-full" onClick={() => navigate("/login?tab=signup")}>
                {t("sidebar.createAccount")}
              </Button>
            </div>
          )
        )}
      </SidebarFooter>

      <SearchModal open={isSearchOpen} onOpenChange={setIsSearchOpen} />
      <NotificationsSheet open={isNotificationsOpen} onOpenChange={setIsNotificationsOpen} />
      <Settings isOpen={isSettingsOpen} setIsOpen={setIsSettingsOpen} />
    </Sidebar>
  );
};
