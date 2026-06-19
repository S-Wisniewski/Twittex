import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { usersApi } from "@/api/users";
import { useAuth } from "@/contexts/useAuth";

const Onboarding = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const userId = currentUser?.id ?? "";

  const [displayName, setDisplayName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: { preventDefault(): void }) => {
    e.preventDefault();
    if (!displayName.trim()) {
      setError(t("onboarding.errors.displayNameRequired"));
      return;
    }
    setError("");
    setLoading(true);
    try {
      await usersApi.updateProfile(userId, { displayName: displayName.trim() });
      sessionStorage.removeItem("pendingOnboarding");
      navigate("/");
    } catch {
      setError(t("onboarding.errors.saveFailed"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm flex flex-col gap-8">
        <div className="flex flex-col items-center gap-3">
          <img src="/Twittex.svg" alt="Twittex" className="size-14" />
          <div className="text-center">
            <h1 className="text-2xl font-bold tracking-tight">Twittex</h1>
            <p className="text-sm text-muted-foreground mt-1">
              {t("auth.tagline")}
            </p>
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-card p-6 shadow-sm flex flex-col gap-5">
          <div className="flex flex-col gap-1">
            <h2 className="text-lg font-semibold">{t("onboarding.title")}</h2>
            <p className="text-sm text-muted-foreground">
              {t("onboarding.subtitle")}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
            {error && (
              <p className="text-xs text-destructive bg-destructive/10 rounded-xl px-3 py-2">
                {error}
              </p>
            )}

            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium">
                {t("onboarding.displayNameLabel")}{" "}
                <span className="text-destructive" aria-hidden>
                  *
                </span>
              </label>
              <Input
                placeholder={t("onboarding.displayNamePlaceholder")}
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                autoFocus
                maxLength={50}
              />
            </div>

            <Button type="submit" className="w-full mt-2" disabled={loading}>
              {loading ? t("common.saving") : t("onboarding.continue")}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Onboarding;
