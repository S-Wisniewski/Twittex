import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate, useSearchParams } from "react-router";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { authApi } from "@/api/auth";
import { useAuth } from "@/contexts/useAuth";

type FormError = Partial<{
  email: string;
  username: string;
  password: string;
  confirmPassword: string;
  general: string;
}>;

const Auth = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { login } = useAuth();

  // --- Sign in state ---
  const [signInEmail, setSignInEmail] = useState("");
  const [signInPassword, setSignInPassword] = useState("");
  const [signInLoading, setSignInLoading] = useState(false);
  const [signInErrors, setSignInErrors] = useState<FormError>({});

  // --- Sign up state ---
  const [signUpEmail, setSignUpEmail] = useState("");
  const [signUpUsername, setSignUpUsername] = useState("");
  const [signUpPassword, setSignUpPassword] = useState("");
  const [signUpConfirm, setSignUpConfirm] = useState("");
  const [signUpLoading, setSignUpLoading] = useState(false);
  const [signUpErrors, setSignUpErrors] = useState<FormError>({});

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    const errors: FormError = {};
    if (!signInEmail) errors.email = t("auth.errors.emailRequired");
    if (!signInPassword) errors.password = t("auth.errors.passwordRequired");
    if (Object.keys(errors).length) {
      setSignInErrors(errors);
      return;
    }

    setSignInErrors({});
    setSignInLoading(true);
    try {
      const res = await authApi.logIn({
        email: signInEmail,
        password: signInPassword,
      });
      await login(res);
      if (sessionStorage.getItem("pendingOnboarding")) {
        navigate("/onboarding");
      } else {
        navigate("/");
      }
    } catch {
      setSignInErrors({ general: t("auth.errors.invalidCredentials") });
    } finally {
      setSignInLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    const errors: FormError = {};
    if (!signUpEmail) errors.email = t("auth.errors.emailRequired");
    if (!signUpUsername) errors.username = t("auth.errors.usernameRequired");
    else if (!/^[a-z0-9_.]+$/i.test(signUpUsername))
      errors.username = t("auth.errors.usernameInvalid");
    if (!signUpPassword) errors.password = t("auth.errors.passwordRequired");
    else if (signUpPassword.length < 8)
      errors.password = t("auth.errors.passwordTooShort");
    if (!signUpConfirm)
      errors.confirmPassword = t("auth.errors.confirmPasswordRequired");
    else if (signUpPassword !== signUpConfirm)
      errors.confirmPassword = t("auth.errors.passwordMismatch");
    if (Object.keys(errors).length) {
      setSignUpErrors(errors);
      return;
    }

    setSignUpErrors({});
    setSignUpLoading(true);
    try {
      await authApi.signUp({
        email: signUpEmail,
        password: signUpPassword,
        username: signUpUsername,
      });
      sessionStorage.setItem("pendingConfirmEmail", signUpEmail);
      navigate("/confirm-email", { state: { email: signUpEmail } });
    } catch {
      setSignUpErrors({ general: t("auth.errors.registrationFailed") });
    } finally {
      setSignUpLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm flex flex-col gap-8">
        {/* Branding */}
        <div className="flex flex-col items-center gap-3">
          <img src="/Twittex.svg" alt="Twittex" className="size-14" />
          <div className="text-center">
            <h1 className="text-2xl font-bold tracking-tight">Twittex</h1>
            <p className="text-sm text-muted-foreground mt-1">
              {t("auth.tagline")}
            </p>
          </div>
        </div>

        {/* Auth card */}
        <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
          <Tabs defaultValue={searchParams.get("tab") === "signup" ? "signup" : "signin"}>
            <TabsList className="w-full mb-6">
              <TabsTrigger value="signin" className="flex-1">
                {t("auth.signIn")}
              </TabsTrigger>
              <TabsTrigger value="signup" className="flex-1">
                {t("auth.signUp")}
              </TabsTrigger>
            </TabsList>

            {/* ── Sign in ── */}
            <TabsContent value="signin">
              <form
                onSubmit={handleSignIn}
                className="flex flex-col gap-4"
                noValidate
              >
                {signInErrors.general && (
                  <p className="text-xs text-destructive bg-destructive/10 rounded-xl px-3 py-2">
                    {signInErrors.general}
                  </p>
                )}

                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium">Email</label>
                  <Input
                    type="email"
                    placeholder={t("auth.emailPlaceholder")}
                    value={signInEmail}
                    onChange={(e) => setSignInEmail(e.target.value)}
                    aria-invalid={!!signInErrors.email}
                    autoComplete="email"
                  />
                  {signInErrors.email && (
                    <p className="text-xs text-destructive">
                      {signInErrors.email}
                    </p>
                  )}
                </div>

                <div className="flex flex-col gap-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium">Password</label>
                    <button
                      type="button"
                      className="text-xs text-muted-foreground hover:text-foreground transition-colors"
                      onClick={() => {
                        /* TODO: navigate to forgot password */
                      }}
                    >
                      {t("auth.forgotPassword")}
                    </button>
                  </div>
                  <PasswordInput
                    placeholder={t("auth.passwordPlaceholder")}
                    value={signInPassword}
                    onChange={(e) => setSignInPassword(e.target.value)}
                    aria-invalid={!!signInErrors.password}
                    autoComplete="current-password"
                  />
                  {signInErrors.password && (
                    <p className="text-xs text-destructive">
                      {signInErrors.password}
                    </p>
                  )}
                </div>

                <Button
                  type="submit"
                  className="w-full mt-2"
                  disabled={signInLoading}
                >
                  {signInLoading ? t("auth.signingIn") : t("auth.signIn")}
                </Button>
              </form>
            </TabsContent>

            {/* ── Sign up ── */}
            <TabsContent value="signup">
              <form
                onSubmit={handleSignUp}
                className="flex flex-col gap-4"
                noValidate
              >
                {signUpErrors.general && (
                  <p className="text-xs text-destructive bg-destructive/10 rounded-xl px-3 py-2">
                    {signUpErrors.general}
                  </p>
                )}

                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium">Email</label>
                  <Input
                    type="email"
                    placeholder={t("auth.emailPlaceholder")}
                    value={signUpEmail}
                    onChange={(e) => setSignUpEmail(e.target.value)}
                    aria-invalid={!!signUpErrors.email}
                    autoComplete="email"
                  />
                  {signUpErrors.email && (
                    <p className="text-xs text-destructive">
                      {signUpErrors.email}
                    </p>
                  )}
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium">Username</label>
                  <div className="flex items-center gap-1">
                    <span className="text-sm text-muted-foreground pl-1">
                      @
                    </span>
                    <Input
                      placeholder={t("auth.usernamePlaceholder")}
                      value={signUpUsername}
                      onChange={(e) =>
                        setSignUpUsername(
                          e.target.value.replace(/[^a-z0-9_.]/gi, ""),
                        )
                      }
                      aria-invalid={!!signUpErrors.username}
                      autoComplete="username"
                      maxLength={30}
                    />
                  </div>
                  {signUpErrors.username && (
                    <p className="text-xs text-destructive">
                      {signUpErrors.username}
                    </p>
                  )}
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium">Password</label>
                  <PasswordInput
                    placeholder={t("auth.passwordPlaceholder")}
                    value={signUpPassword}
                    onChange={(e) => setSignUpPassword(e.target.value)}
                    aria-invalid={!!signUpErrors.password}
                    autoComplete="new-password"
                  />
                  {signUpErrors.password && (
                    <p className="text-xs text-destructive">
                      {signUpErrors.password}
                    </p>
                  )}
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium">
                    Confirm password
                  </label>
                  <PasswordInput
                    placeholder={t("auth.passwordPlaceholder")}
                    value={signUpConfirm}
                    onChange={(e) => setSignUpConfirm(e.target.value)}
                    aria-invalid={!!signUpErrors.confirmPassword}
                    autoComplete="new-password"
                  />
                  {signUpErrors.confirmPassword && (
                    <p className="text-xs text-destructive">
                      {signUpErrors.confirmPassword}
                    </p>
                  )}
                </div>

                <Button
                  type="submit"
                  className="w-full mt-2"
                  disabled={signUpLoading}
                >
                  {signUpLoading ? t("auth.creatingAccount") : t("auth.signUp")}
                </Button>
              </form>
            </TabsContent>
          </Tabs>

          <div className="mt-6">
            <Separator className="mb-4" />
            <p className="text-xs text-center text-muted-foreground">
              {t("auth.terms")}{" "}
              <span className="underline cursor-pointer hover:text-foreground transition-colors">
                {t("auth.termsOfService")}
              </span>{" "}
              and{" "}
              <span className="underline cursor-pointer hover:text-foreground transition-colors">
                {t("auth.privacyPolicy")}
              </span>
              .
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Auth;
