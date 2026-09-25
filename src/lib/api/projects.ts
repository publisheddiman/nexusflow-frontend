import { api } from "@/lib/api/client";
import { buildListParams, type ListQuery } from "@/lib/api/query";
import type { PaginatedResponse, Project } from "@/types/api";

export type ProjectPerson = {
  id: string;
  name: string;
  email: string;
  departmentId?: string | null;
};

export type ProjectMember = {
  id: string;
  userId: string;
  createdAt?: string;
  user: ProjectPerson;
};

export type ProjectRecord = Project & {
  clientId?: string;
  client?: ProjectPerson;
  members?: ProjectMember[];
};

export type CreateProjectPayload = {
  name: string;
  description?: string;
  clientId: string;
  memberIds: string[];
};

export type UpdateProjectPayload = {
  name?: string;
  description?: string | null;
  clientId?: string;
  memberIds?: string[];
};

export type ProjectMetrics = {
  project: {
    id: string;
    name: string;
  };
  metrics: {
    totalTasks: number;
    completedTasks: number;
    inProgressTasks: number;
    blockedTasks: number;
    todoTasks: number;
    completionPercentage: number;
  };
};

export async function getProjects(query: ListQuery = {}) {
  const response = await api.get<PaginatedResponse<ProjectRecord>>(
    "/projects",
    {
      params: buildListParams(query),
    },
  );

  return response.data;
}

export async function getProjectById(projectId: string) {
  const response = await api.get<{
    message: string;
    data: ProjectRecord;
  }>(`/projects/${projectId}`);

  return response.data.data;
}

export async function createProject(payload: CreateProjectPayload) {
  const response = await api.post<{
    message: string;
    data: ProjectRecord;
  }>("/projects", payload);

  return response.data.data;
}

export async function updateProject(
  projectId: string,
  payload: UpdateProjectPayload,
) {
  const response = await api.patch<{
    message: string;
    data: ProjectRecord;
  }>(`/projects/${projectId}`, payload);

  return response.data.data;
}

export async function deleteProject(projectId: string) {
  const response = await api.delete<{
    message: string;
    data: {
      id: string;
      deletedAt: string;
    };
  }>(`/projects/${projectId}`);

  return response.data.data;
}

export async function getProjectMetrics(projectId: string) {
  const response = await api.get<{
    message: string;
    data: ProjectMetrics;
  }>(`/projects/${projectId}/metrics`);

  return response.data.data;
}
