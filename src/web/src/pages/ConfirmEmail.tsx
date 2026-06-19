import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate, useLocation } from "react-router";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { authApi } from "@/api/auth";

const ConfirmEmail = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const email =
    (location.state as { email?: string })?.email ??
    sessionStorage.getItem("pendingConfirmEmail") ??
    "";

  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: { preventDefault(): void }) => {
    e.preventDefault();
    if (!code.trim()) {
      setError(t("confirmEmail.errors.codeRequired"));
      return;
    }
    setError("");
    setLoading(true);
    try {
      await authApi.confirmEmail({ email: email, confirmationCode: code });
      sessionStorage.removeItem("pendingConfirmEmail");
      sessionStorage.setItem("pendingOnboarding", "true");
      navigate("/login");
    } catch {
      setError(t("confirmEmail.errors.invalidCode"));
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
            <h2 className="text-lg font-semibold">{t("confirmEmail.title")}</h2>
            <p className="text-sm text-muted-foreground">
              {t("confirmEmail.sent")}
              {email ? <strong className="text-foreground"> {email}</strong> : ` ${t("confirmEmail.yourEmail")}`}.{" "}
              {t("confirmEmail.instruction")}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
            {error && (
              <p className="text-xs text-destructive bg-destructive/10 rounded-xl px-3 py-2">
                {error}
              </p>
            )}

            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium">{t("confirmEmail.label")}</label>
              <Input
                type="text"
                placeholder={t("confirmEmail.placeholder")}
                value={code}
                onChange={(e) =>
                  setCode(e.target.value.replace(/\D/g, "").slice(0, 6))
                }
                autoComplete="one-time-code"
                inputMode="numeric"
                maxLength={6}
              />
            </div>

            <Button type="submit" className="w-full mt-2" disabled={loading}>
              {loading ? t("confirmEmail.verifying") : t("confirmEmail.verify")}
            </Button>
          </form>

          <p className="text-xs text-center text-muted-foreground">
            {t("confirmEmail.alreadyVerified")}{" "}
            <button
              type="button"
              className="underline hover:text-foreground transition-colors"
              onClick={() => navigate("/login")}
            >
              {t("auth.signIn")}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default ConfirmEmail;
