import apiClient, { TOKEN_KEY } from "@/api/client";
import type {
  User,
  LoginPayload,
  LoginResponse,
  ApiResponse,
} from "@/api/types";

export async function loginApi(payload: LoginPayload): Promise<string> {
  const res = await apiClient.post<ApiResponse<LoginResponse>>(
    "/auth/login",
    payload,
  );
  const token = res.data.data.accessToken;
  localStorage.setItem(TOKEN_KEY, token);
  return token;
}

export async function fetchCurrentUser(): Promise<User> {
  const res = await apiClient.get<ApiResponse<User>>("/auth/me");
  if (!res.data?.data) {
    throw new Error("Missing user payload");
  }
  return res.data.data;
}

export function clearToken(): void {
  localStorage.removeItem(TOKEN_KEY);
}

export function getStoredToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}
