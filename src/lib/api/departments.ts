import { api } from "@/lib/api/client";

export type Department = {
  id: string;
  name: string;
};

export async function getDepartments() {
  const response = await api.get<{
    message: string;
    data: Department[];
  }>("/departments");

  return response.data.data;
}

