import { createContext, useContext } from "react";
import type { TokenResponse } from "@/api/auth";
import type { User } from "@/types/User";

export type AuthContextValue = {
  currentUser: User | null;
  isLoading: boolean;
  login: (tokens: TokenResponse) => Promise<void>;
  logout: () => Promise<void>;
};

export const AuthContext = createContext<AuthContextValue | null>(null);

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
