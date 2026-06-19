import { apiClient } from "./client";

export type CreatePostDto = {
  content: string;
  parentPostId?: number;
};

type ISignUp = {
  email: string;
  password: string;
  username: string;
};
type ILogIn = {
  email: string;
  password: string;
};

export type TokenResponse = {
  accessToken: string;
  idToken: string;
  refreshToken: string;
  expiresIn: string;
};

export const authApi = {
  signUp: (body: ISignUp) =>
    apiClient.post<string>("/api/auth/sign-up", body),

  logIn: (body: ILogIn) =>
    apiClient.post<TokenResponse>(`/api/auth/log-in`, body),

  refreshToken: () => apiClient.post<TokenResponse>(`/api/auth/refresh-token`),

  logOut: () => apiClient.post("/api/auth/log-out"),

  confirmEmail: (body: { email: string; confirmationCode: string }) =>
    apiClient.post(`/api/auth/confirm-email`, body),

  changePassword: (body: { currentPassword: string; newPassword: string }) =>
    apiClient.post<void>("/api/auth/change-password", body),
};
