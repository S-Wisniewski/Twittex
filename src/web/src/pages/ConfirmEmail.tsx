import { useState } from "react";
import { useNavigate, useLocation } from "react-router";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { authApi } from "@/api/auth";

const ConfirmEmail = () => {
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
      setError("Please enter the confirmation code.");
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
      setError("Invalid or expired code. Please try again.");
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
              Community-moderated social platform
            </p>
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-card p-6 shadow-sm flex flex-col gap-5">
          <div className="flex flex-col gap-1">
            <h2 className="text-lg font-semibold">Confirm your email</h2>
            <p className="text-sm text-muted-foreground">
              We sent a verification code to
              {email ? <strong className="text-foreground"> {email}</strong> : " your email address"}.
              Enter it below to activate your account.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
            {error && (
              <p className="text-xs text-destructive bg-destructive/10 rounded-xl px-3 py-2">
                {error}
              </p>
            )}

            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium">Confirmation code</label>
              <Input
                type="text"
                placeholder="123456"
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
              {loading ? "Verifying…" : "Verify email"}
            </Button>
          </form>

          <p className="text-xs text-center text-muted-foreground">
            Already verified?{" "}
            <button
              type="button"
              className="underline hover:text-foreground transition-colors"
              onClick={() => navigate("/login")}
            >
              Sign in
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default ConfirmEmail;
