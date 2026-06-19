import { Lock, Settings as SettingsIcon, Upload, User } from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { ModeToggle } from "./mode-toggle";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { PasswordInput } from "./ui/password-input";
import { Textarea } from "./ui/textarea";
import { Separator } from "./ui/separator";
import UserAvatar from "./UserAvatar";
import AvatarCropDialog from "./AvatarCropDialog";
import { useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/contexts/useAuth";
import { usersApi } from "@/api/users";
import { authApi } from "@/api/auth";
import { useNavigate } from "react-router";
import { toast } from "sonner";

type SettingsProps = {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
};

const settingsTabs = [
  { key: "general", icon: <SettingsIcon /> },
  { key: "profile", icon: <User /> },
  { key: "security", icon: <Lock /> },
];

const SettingsForm = ({ setIsOpen }: { setIsOpen: (open: boolean) => void }) => {
  const { t, i18n } = useTranslation();
  const { currentUser, logout, refreshUser } = useAuth();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [displayName, setDisplayName] = useState(currentUser?.userName ?? "");
  const [username, setUsername] = useState(currentUser?.userName ?? "");
  const [bio, setBio] = useState(currentUser?.content ?? "");
  const [avatarUrl, setAvatarUrl] = useState(currentUser?.userAvatarUrl ?? "");
  const [cropSrc, setCropSrc] = useState<string | null>(null);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const passwordMismatch =
    newPassword && confirmPassword && newPassword !== confirmPassword;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setCropSrc(reader.result as string);
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  const handleAvatarSave = async (blob: Blob) => {
    if (!currentUser) return;
    const { uploadUrl, publicUrl } = await usersApi.getAvatarUploadUrl();
    await fetch(uploadUrl, {
      method: "PUT",
      body: blob,
      headers: { "Content-Type": "image/jpeg" },
    });
    await usersApi.updateProfile(currentUser.id, { avatarUrl: publicUrl });
    await refreshUser();
    setAvatarUrl(publicUrl);
    setCropSrc(null);
    toast.success(t("avatar.toasts.updated"));
  };

  const handleSaveProfile = async () => {
    if (!currentUser) return;
    try {
      await usersApi.updateProfile(currentUser.id, {
        displayName,
        username,
        bio,
        avatarUrl,
      });
      await refreshUser();
      toast.success(t("settings.profile.toasts.saved"));
      setIsOpen(false);
    } catch {
      toast.error(t("settings.profile.toasts.saveFailed"));
    }
  };

  const handleChangePassword = async () => {
    if (!currentPassword || !newPassword || passwordMismatch) return;
    try {
      await authApi.changePassword({ currentPassword, newPassword });
      toast.success(t("settings.security.toasts.passwordUpdated"));
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch {
      toast.error(t("settings.security.toasts.passwordFailed"));
    }
  };

  const handleDeleteAccount = async () => {
    if (!currentUser) return;
    try {
      await usersApi.deleteAccount(currentUser.id);
      await logout();
      navigate("/login");
    } catch {
      toast.error(t("settings.security.toasts.deleteFailed"));
    }
  };

  const handleLanguageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const lang = e.target.value;
    i18n.changeLanguage(lang);
    localStorage.setItem("language", lang);
  };

  return (
    <>
      {cropSrc && (
        <AvatarCropDialog
          imageSrc={cropSrc}
          open={!!cropSrc}
          onClose={() => setCropSrc(null)}
          onSave={handleAvatarSave}
        />
      )}

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
              {t(`settings.tabs.${item.key}`)}
            </TabsTrigger>
          ))}
        </TabsList>

        {/* ── General ── */}
        <TabsContent value={"general"} className={"p-6 space-y-6 flex-1"}>
          <div>
            <h3 className="font-semibold text-base mb-1">{t("settings.general.title")}</h3>
            <p className="text-sm text-muted-foreground">
              {t("settings.general.subtitle")}
            </p>
          </div>
          <Separator />

          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">{t("settings.general.theme")}</p>
              <p className="text-xs text-muted-foreground">
                {t("settings.general.themeDesc")}
              </p>
            </div>
            <ModeToggle />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">{t("settings.general.language")}</p>
              <p className="text-xs text-muted-foreground">
                {t("settings.general.languageDesc")}
              </p>
            </div>
            <select
              value={i18n.language}
              onChange={handleLanguageChange}
              className="rounded-xl border border-input bg-input/30 px-3 py-2 text-sm outline-none focus-visible:border-ring transition-colors"
            >
              <option value="en">{t("settings.general.languages.en")}</option>
              <option value="pl">{t("settings.general.languages.pl")}</option>
              <option value="de">{t("settings.general.languages.de")}</option>
              <option value="fr">{t("settings.general.languages.fr")}</option>
            </select>
          </div>

        </TabsContent>

        {/* ── Profile ── */}
        <TabsContent value={"profile"} className={"p-6 space-y-6 flex-1"}>
          <div>
            <h3 className="font-semibold text-base mb-1">{t("settings.profile.title")}</h3>
            <p className="text-sm text-muted-foreground">
              {t("settings.profile.subtitle")}
            </p>
          </div>
          <Separator />

          <div className="flex items-center gap-4">
            <div className="relative group">
              <UserAvatar url={avatarUrl} name={username} size="medium" />
              <button
                onClick={() => fileInputRef.current?.click()}
                className="absolute inset-0 flex items-center justify-center rounded-full bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                aria-label={t("avatar.uploadPhoto")}
              >
                <Upload className="size-5 text-white" />
              </button>
            </div>
            <div className="flex flex-col gap-1.5">
              <p className="text-sm font-medium">{t("avatar.label")}</p>
              <p className="text-xs text-muted-foreground">
                {t("avatar.uploadHint")}
              </p>
              <Button
                variant="outline"
                size="sm"
                className="w-fit mt-1"
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload className="size-3.5" />
                {t("avatar.uploadPhoto")}
              </Button>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileChange}
            />
          </div>

          <Separator />

          <div className="grid gap-4 max-w-md">
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium">{t("settings.profile.displayName")}</label>
              <Input
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder={t("settings.profile.displayNamePlaceholder")}
                maxLength={50}
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium">{t("settings.profile.username")}</label>
              <div className="flex items-center gap-1">
                <span className="text-sm text-muted-foreground">@</span>
                <Input
                  value={username}
                  onChange={(e) =>
                    setUsername(e.target.value.replace(/[^a-z0-9_]/gi, ""))
                  }
                  placeholder={t("settings.profile.usernamePlaceholder")}
                  maxLength={30}
                />
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium">{t("settings.profile.bio")}</label>
              <Textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder={t("settings.profile.bioPlaceholder")}
                maxLength={160}
              />
              <span className="text-xs text-muted-foreground text-right">
                {bio.length}/160
              </span>
            </div>
          </div>

          <div className="flex gap-2">
            <Button onClick={handleSaveProfile}>{t("common.save")}</Button>
            <Button variant="outline" onClick={() => setIsOpen(false)}>
              {t("common.cancel")}
            </Button>
          </div>
        </TabsContent>

        {/* ── Security ── */}
        <TabsContent value={"security"} className={"p-6 space-y-6 flex-1"}>
          <div>
            <h3 className="font-semibold text-base mb-1">{t("settings.security.title")}</h3>
            <p className="text-sm text-muted-foreground">
              {t("settings.security.subtitle")}
            </p>
          </div>
          <Separator />

          <div className="flex flex-col gap-4 max-w-md">
            <p className="text-sm font-medium">{t("settings.security.changePassword")}</p>

            <div className="flex flex-col gap-1.5">
              <label className="text-sm text-muted-foreground">
                {t("settings.security.currentPassword")}
              </label>
              <PasswordInput
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="••••••••"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-sm text-muted-foreground">
                {t("settings.security.newPassword")}
              </label>
              <PasswordInput
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="••••••••"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-sm text-muted-foreground">
                {t("settings.security.confirmPassword")}
              </label>
              <PasswordInput
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                aria-invalid={!!passwordMismatch}
              />
              {passwordMismatch && (
                <p className="text-xs text-destructive">
                  {t("settings.security.passwordMismatch")}
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
              {t("settings.security.updatePassword")}
            </Button>
          </div>

          <Separator />

          <div className="flex flex-col gap-3 max-w-md">
            <p className="text-sm font-medium">{t("settings.security.dangerZone")}</p>
            <div className="flex items-center justify-between rounded-xl border border-destructive/30 bg-destructive/5 p-4">
              <div>
                <p className="text-sm font-medium text-destructive">
                  {t("settings.security.deleteAccount")}
                </p>
                <p className="text-xs text-muted-foreground">
                  {t("settings.security.deleteAccountDesc")}
                </p>
              </div>
              <Button
                variant="destructive"
                size="sm"
                onClick={handleDeleteAccount}
              >
                {t("common.delete")}
              </Button>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </>
  );
};

const Settings = ({ isOpen, setIsOpen }: SettingsProps) => {
  return (
    <Dialog open={isOpen} onOpenChange={() => setIsOpen(false)}>
      <DialogContent className={"p-0 overflow-hidden h-9/12 min-w-[75%]"}>
        <SettingsForm key={String(isOpen)} setIsOpen={setIsOpen} />
      </DialogContent>
    </Dialog>
  );
};

export default Settings;
