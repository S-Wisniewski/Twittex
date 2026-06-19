import { Lock, Settings as SettingsIcon, User } from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { ModeToggle } from "./mode-toggle";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { Separator } from "./ui/separator";
import UserAvatar from "./UserAvatar";
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { usersApi } from "@/api/users";
import { authApi } from "@/api/auth";
import { useNavigate } from "react-router";
import { toast } from "sonner";

type SettingsProps = {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
};

const settingsTabs = [
  { key: "general", value: "General", icon: <SettingsIcon /> },
  { key: "profile", value: "Profile", icon: <User /> },
  { key: "security", value: "Security", icon: <Lock /> },
];

const Settings = ({ isOpen, setIsOpen }: SettingsProps) => {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();

  const [displayName, setDisplayName] = useState("");
  const [username, setUsername] = useState("");
  const [bio, setBio] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  useEffect(() => {
    if (isOpen && currentUser) {
      setDisplayName(currentUser.userName);
      setUsername(currentUser.userName);
      setBio(currentUser.content ?? "");
      setAvatarUrl(currentUser.userAvatarUrl ?? "");
    }
  }, [isOpen, currentUser]);

  const passwordMismatch =
    newPassword && confirmPassword && newPassword !== confirmPassword;

  const handleSaveProfile = async () => {
    if (!currentUser) return;
    try {
      await usersApi.updateProfile(currentUser.id, {
        displayName,
        username,
        bio,
        avatarUrl,
      });
      toast.success("Profile saved");
      setIsOpen(false);
    } catch {
      toast.error("Failed to save profile. Please try again.");
    }
  };

  const handleChangePassword = async () => {
    if (!currentPassword || !newPassword || passwordMismatch) return;
    try {
      await authApi.changePassword({ currentPassword, newPassword });
      toast.success("Password updated");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch {
      toast.error("Failed to update password. Please try again.");
    }
  };

  const handleDeleteAccount = async () => {
    if (!currentUser) return;
    try {
      await usersApi.deleteAccount(currentUser.id);
      await logout();
      navigate("/login");
    } catch {
      toast.error("Failed to delete account. Please try again.");
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={() => setIsOpen(false)}>
      <DialogContent className={"p-0 overflow-hidden h-9/12 min-w-[75%]"}>
        <Tabs defaultValue={"general"} orientation="vertical">
          <TabsList
            className={"bg-sidebar w-1/4 min-h-full justify-start p-4"}
            style={{ borderRadius: 0 }}
          >
            {settingsTabs.map((item) => (
              <TabsTrigger
                key={item.key}
                value={item.key}
                className={"max-h-fit gap-2"}
              >
                {item.icon}
                {item.value}
              </TabsTrigger>
            ))}
          </TabsList>

          {/* ── General ── */}
          <TabsContent value={"general"} className={"p-6 space-y-6 flex-1"}>
            <div>
              <h3 className="font-semibold text-base mb-1">General</h3>
              <p className="text-sm text-muted-foreground">
                App preferences and display settings.
              </p>
            </div>
            <Separator />

            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">Theme</p>
                <p className="text-xs text-muted-foreground">
                  Switch between light and dark mode.
                </p>
              </div>
              <ModeToggle />
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">Language</p>
                <p className="text-xs text-muted-foreground">
                  Display language for the interface.
                </p>
              </div>
              <select className="rounded-xl border border-input bg-input/30 px-3 py-2 text-sm outline-none focus-visible:border-ring transition-colors">
                <option value="en">English</option>
                <option value="pl">Polish</option>
                <option value="de">German</option>
                <option value="fr">French</option>
              </select>
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">Notifications</p>
                <p className="text-xs text-muted-foreground">
                  Email notifications for new followers and likes.
                </p>
              </div>
              <input type="checkbox" className="size-4 cursor-pointer" defaultChecked />
            </div>
          </TabsContent>

          {/* ── Profile ── */}
          <TabsContent value={"profile"} className={"p-6 space-y-6 flex-1"}>
            <div>
              <h3 className="font-semibold text-base mb-1">Profile</h3>
              <p className="text-sm text-muted-foreground">
                Manage your public information.
              </p>
            </div>
            <Separator />

            <div className="flex items-center gap-4">
              <UserAvatar url={avatarUrl} name={username} size="medium" />
              <div className="flex flex-col gap-1">
                <p className="text-sm font-medium">Avatar</p>
                <p className="text-xs text-muted-foreground">
                  Paste a URL to update your avatar.
                </p>
                <Input
                  value={avatarUrl}
                  onChange={(e) => setAvatarUrl(e.target.value)}
                  placeholder="https://..."
                  className="mt-1 w-72"
                />
              </div>
            </div>

            <Separator />

            <div className="grid gap-4 max-w-md">
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium">Display name</label>
                <Input
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="Your name"
                  maxLength={50}
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium">Username</label>
                <div className="flex items-center gap-1">
                  <span className="text-sm text-muted-foreground">@</span>
                  <Input
                    value={username}
                    onChange={(e) =>
                      setUsername(e.target.value.replace(/[^a-z0-9_]/gi, ""))
                    }
                    placeholder="username"
                    maxLength={30}
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium">Bio</label>
                <Textarea
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Tell the world something about yourself"
                  maxLength={160}
                />
                <span className="text-xs text-muted-foreground text-right">
                  {bio.length}/160
                </span>
              </div>
            </div>

            <div className="flex gap-2">
              <Button onClick={handleSaveProfile}>Save changes</Button>
              <Button variant="outline" onClick={() => setIsOpen(false)}>
                Cancel
              </Button>
            </div>
          </TabsContent>

          {/* ── Security ── */}
          <TabsContent value={"security"} className={"p-6 space-y-6 flex-1"}>
            <div>
              <h3 className="font-semibold text-base mb-1">Security</h3>
              <p className="text-sm text-muted-foreground">
                Manage your password and account security.
              </p>
            </div>
            <Separator />

            <div className="flex flex-col gap-4 max-w-md">
              <p className="text-sm font-medium">Change password</p>

              <div className="flex flex-col gap-1.5">
                <label className="text-sm text-muted-foreground">
                  Current password
                </label>
                <Input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="••••••••"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-sm text-muted-foreground">
                  New password
                </label>
                <Input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="••••••••"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-sm text-muted-foreground">
                  Confirm new password
                </label>
                <Input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  aria-invalid={!!passwordMismatch}
                />
                {passwordMismatch && (
                  <p className="text-xs text-destructive">
                    Passwords do not match.
                  </p>
                )}
              </div>

              <Button
                disabled={
                  !currentPassword ||
                  !newPassword ||
                  !confirmPassword ||
                  !!passwordMismatch
                }
                onClick={handleChangePassword}
              >
                Update password
              </Button>
            </div>

            <Separator />

            <div className="flex flex-col gap-3 max-w-md">
              <p className="text-sm font-medium">Danger zone</p>
              <div className="flex items-center justify-between rounded-xl border border-destructive/30 bg-destructive/5 p-4">
                <div>
                  <p className="text-sm font-medium text-destructive">
                    Delete account
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Permanently delete your account and all data.
                  </p>
                </div>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={handleDeleteAccount}
                >
                  Delete
                </Button>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default Settings;
