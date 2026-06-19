import { useEffect, useState, type ReactNode } from "react";
import { usersApi } from "@/api/users";
import { authApi, type TokenResponse } from "@/api/auth";
import type { User } from "@/types/User";
import { AuthContext } from "./useAuth";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(() => !!sessionStorage.getItem("accessToken"));

  useEffect(() => {
    const accessToken = sessionStorage.getItem("accessToken");
    if (!accessToken) return;

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

  async function refreshUser() {
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
    <AuthContext.Provider value={{ currentUser, isLoading, login, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}
