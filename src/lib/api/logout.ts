import { api } from "@/lib/api/client";

export async function logoutRequest() {
  await api.post("/auth/logout");
}
