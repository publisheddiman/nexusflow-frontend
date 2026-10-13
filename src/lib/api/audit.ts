import { api } from "@/lib/api/client";
import { buildListParams, type ListQuery } from "@/lib/api/query";
import type { PaginatedResponse } from "@/types/api";

export type AuditRecord = {
  id: string;
  taskId: string;
  userId: string;
  changedColumn: string;
  oldValue: string | null;
  newValue: string | null;
  createdAt: string;
  user: {
    id: string;
    name: string;
    email: string;
  };
  task: {
    id: string;
    title: string;
    projectId: string;
    project: {
      id: string;
      name: string;
    };
  };
};

export async function getAuditLogs(query: ListQuery = {}) {
  const response = await api.get<PaginatedResponse<AuditRecord>>("/audit", {
    params: buildListParams(query),
  });

  return response.data;
}

export async function getTaskAuditLogs(taskId: string, query: ListQuery = {}) {
  const response = await api.get<PaginatedResponse<AuditRecord>>(
    `/audit/tasks/${taskId}`,
    {
      params: buildListParams(query),
    },
  );

  return response.data;
}

