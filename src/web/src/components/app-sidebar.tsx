import * as React from "react";
import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { Bell, Home, LogOut, Pencil, Search, Settings as SettingsIcon } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { postsApi } from "@/api/posts";

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
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export const AppSidebar = ({
  ...props
}: React.ComponentProps<typeof Sidebar>) => {
  const navigate = useNavigate();
  const { currentUser, isLoading, logout } = useAuth();
  const queryClient = useQueryClient();

  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const createPostMutation = useMutation({
    mutationFn: (content: string) => postsApi.create({ content }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["feed"] });
      toast.success("Post submitted", { description: "Your post is pending review." });
      navigate("/");
    },
    onError: () => toast.error("Failed to create post. Please try again."),
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
        {/* Primary nav */}
        <SidebarGroup>
          <SidebarMenu className="gap-1">
            <SidebarMenuItem>
              <SidebarMenuButton onClick={() => navigate("/", { replace: true })}>
                <Home />
                <span>Home</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton onClick={() => setIsSearchOpen(true)}>
                <Search />
                <span>Search</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroup>

        {/* New post — authenticated only */}
        {currentUser && (
          <SidebarGroup>
            <ComposePostDialog
              trigger={
                <Button className="w-full gap-2">
                  <Pencil />
                  New post
                </Button>
              }
              userName={currentUser.userName}
              userAvatarUrl={currentUser.userAvatarUrl}
              onSubmit={handleNewPost}
            />
          </SidebarGroup>
        )}

        {/* Secondary nav — pushed to bottom of scrollable area */}
        <SidebarGroup className="mt-auto">
          <SidebarMenu className="gap-1">
            <SidebarMenuItem>
              <SidebarMenuButton onClick={() => currentUser ? setIsNotificationsOpen(true) : navigate("/login")}>
                <Bell />
                <span>Notifications</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton onClick={() => currentUser ? setIsSettingsOpen(true) : navigate("/login")}>
                <SettingsIcon />
                <span>Settings</span>
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
                title="Log out"
              >
                <LogOut className="size-4" />
              </Button>
            </div>
          ) : (
            <div className="flex flex-col gap-2 p-2">
              <Button className="w-full" onClick={() => navigate("/login")}>
                Sign in
              </Button>
              <Button variant="outline" className="w-full" onClick={() => navigate("/login?tab=signup")}>
                Create account
              </Button>
            </div>
          )
        )}
      </SidebarFooter>

      {/* Modals / sheets */}
      <SearchModal open={isSearchOpen} onOpenChange={setIsSearchOpen} />
      <NotificationsSheet open={isNotificationsOpen} onOpenChange={setIsNotificationsOpen} />
      <Settings isOpen={isSettingsOpen} setIsOpen={setIsSettingsOpen} />
    </Sidebar>
  );
};
