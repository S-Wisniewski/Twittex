import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { usersApi } from "@/api/users";
import { authApi, type TokenResponse } from "@/api/auth";
import type { User } from "@/types/User";

type AuthContextValue = {
  currentUser: User | null;
  isLoading: boolean;
  login: (tokens: TokenResponse) => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const accessToken = sessionStorage.getItem("accessToken");
    if (!accessToken) {
      setIsLoading(false);
      return;
    }

    usersApi
      .getMe()
      .then(setCurrentUser)
      .catch(() => {
        sessionStorage.clear();
      })
      .finally(() => setIsLoading(false));
  }, []);

  async function login(tokens: TokenResponse) {
    sessionStorage.setItem("accessToken", tokens.accessToken);
    sessionStorage.setItem("idToken", tokens.idToken);
    sessionStorage.setItem("refreshToken", tokens.refreshToken);
    const user = await usersApi.getMe();
    setCurrentUser(user);
  }

  async function logout() {
    try {
      await authApi.logOut();
    } catch {
      // best-effort
    }
    sessionStorage.clear();
    setCurrentUser(null);
  }

  return (
    <AuthContext.Provider value={{ currentUser, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
