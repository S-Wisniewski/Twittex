import { useState } from "react";
import { useNavigate } from "react-router";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { authApi } from "@/api/auth";

type FormError = Partial<{
  email: string;
  username: string;
  password: string;
  confirmPassword: string;
  general: string;
}>;

const Auth = () => {
  const navigate = useNavigate();

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
    if (!signInEmail) errors.email = "Email is required.";
    if (!signInPassword) errors.password = "Password is required.";
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
      sessionStorage.setItem("accessToken", res.accessToken);
      sessionStorage.setItem("refreshToken", res.refreshToken);
      sessionStorage.setItem("idToken", res.idToken);
      sessionStorage.setItem("expiresIn", res.expiresIn);

      const payload = JSON.parse(atob(res.idToken.split(".")[1]));
      sessionStorage.setItem("userId", payload.sub);

      if (sessionStorage.getItem("pendingOnboarding")) {
        navigate("/onboarding");
      } else {
        navigate("/");
      }
    } catch {
      setSignInErrors({ general: "Invalid email or password." });
    } finally {
      setSignInLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    const errors: FormError = {};
    if (!signUpEmail) errors.email = "Email is required.";
    if (!signUpUsername) errors.username = "Username is required.";
    else if (!/^[a-z0-9_.]+$/i.test(signUpUsername))
      errors.username = "Only letters, numbers and underscores.";
    if (!signUpPassword) errors.password = "Password is required.";
    else if (signUpPassword.length < 8)
      errors.password = "At least 8 characters.";
    if (!signUpConfirm)
      errors.confirmPassword = "Please confirm your password.";
    else if (signUpPassword !== signUpConfirm)
      errors.confirmPassword = "Passwords do not match.";
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
      setSignUpErrors({ general: "Registration failed. Please try again." });
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
              Community-moderated social platform
            </p>
          </div>
        </div>

        {/* Auth card */}
        <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
          <Tabs defaultValue="signin">
            <TabsList className="w-full mb-6">
              <TabsTrigger value="signin" className="flex-1">
                Sign in
              </TabsTrigger>
              <TabsTrigger value="signup" className="flex-1">
                Sign up
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
                    placeholder="you@example.com"
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
                      Forgot password?
                    </button>
                  </div>
                  <Input
                    type="password"
                    placeholder="••••••••"
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
                  {signInLoading ? "Signing in…" : "Sign in"}
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
                    placeholder="you@example.com"
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
                      placeholder="your_username"
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
                  <Input
                    type="password"
                    placeholder="••••••••"
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
                  <Input
                    type="password"
                    placeholder="••••••••"
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
                  {signUpLoading ? "Creating account…" : "Create account"}
                </Button>
              </form>
            </TabsContent>
          </Tabs>

          <div className="mt-6">
            <Separator className="mb-4" />
            <p className="text-xs text-center text-muted-foreground">
              By continuing you agree to our{" "}
              <span className="underline cursor-pointer hover:text-foreground transition-colors">
                Terms of Service
              </span>{" "}
              and{" "}
              <span className="underline cursor-pointer hover:text-foreground transition-colors">
                Privacy Policy
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
