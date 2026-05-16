import * as React from "react";
import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { Bell, Home, LogOut, Pencil, Search, Settings as SettingsIcon } from "lucide-react";

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
import { CURRENT_USER } from "@/lib/currentUser";
import { toast } from "sonner";

export const AppSidebar = ({
  ...props
}: React.ComponentProps<typeof Sidebar>) => {
  const navigate = useNavigate();

  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const handleNewPost = (content: string) => {
    // TODO: postsApi.create({ content })
    console.log("new post", content);
    toast.success("Post submitted", {
      description: "Your post is pending review.",
    });
    navigate("/");
  };

  const handleLogout = () => {
    // TODO: Auth.signOut() — Cognito
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

        {/* New post */}
        <SidebarGroup>
          <ComposePostDialog
            trigger={
              <Button className="w-full gap-2">
                <Pencil />
                New post
              </Button>
            }
            userName={CURRENT_USER.name}
            userAvatarUrl={CURRENT_USER.avatarUrl}
            onSubmit={handleNewPost}
          />
        </SidebarGroup>

        {/* Secondary nav — pushed to bottom of scrollable area */}
        <SidebarGroup className="mt-auto">
          <SidebarMenu className="gap-1">
            <SidebarMenuItem>
              <SidebarMenuButton onClick={() => setIsNotificationsOpen(true)}>
                <Bell />
                <span>Notifications</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton onClick={() => setIsSettingsOpen(true)}>
                <SettingsIcon />
                <span>Settings</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>

      {/* User row — avatar+name → profile, logout separate */}
      <SidebarFooter>
        <div className="flex items-center gap-2 px-1 py-1">
          <button
            onClick={() => navigate(`/${CURRENT_USER.id}`)}
            className="flex flex-1 items-center gap-3 min-w-0 rounded-lg p-2 text-left transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
          >
            <UserAvatar url={CURRENT_USER.avatarUrl} name={CURRENT_USER.name} />
            <div className="flex flex-col min-w-0">
              <span className="truncate text-sm font-medium leading-tight">
                {CURRENT_USER.name}
              </span>
              <span className="truncate text-xs text-muted-foreground leading-tight">
                @{CURRENT_USER.id}
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
      </SidebarFooter>

      {/* Modals / sheets */}
      <SearchModal open={isSearchOpen} onOpenChange={setIsSearchOpen} />
      <NotificationsSheet open={isNotificationsOpen} onOpenChange={setIsNotificationsOpen} />
      <Settings isOpen={isSettingsOpen} setIsOpen={setIsSettingsOpen} />
    </Sidebar>
  );
};
