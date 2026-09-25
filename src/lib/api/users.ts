import { api } from "@/lib/api/client";

export type TeamUser = {
  id: string;
  name: string;
  email: string;
  avatarUrl: string | null;
  role: "PM" | "INTERNAL" | "CLIENT";
  department: {
    id: string;
    name: string;
  } | null;
  createdAt: string;
};

export async function getUsers() {
  const response = await api.get<{
    message: string;
    data: TeamUser[];
  }>("/users");

  return response.data.data;
}
