import { api } from "@/lib/api/client";
import type { ApiResponse, LoginResponse, User } from "@/types/api";

export type LoginInput = {
  email: string;
  password: string;
};

export type RegisterInput = {
  name: string;
  email: string;
  password: string;
  departmentId: string;
};

export async function loginRequest(input: LoginInput) {
  const response = await api.post<ApiResponse<LoginResponse>>(
    "/auth/login",
    input,
  );

  return response.data.data;
}

export async function registerRequest(input: RegisterInput) {
  const response = await api.post<ApiResponse<User>>("/auth/register", input);

  return response.data.data;
}

export async function logoutRequest() {
  await api.post("/auth/logout");
}

