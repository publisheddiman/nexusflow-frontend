import { api } from "@/lib/api/client";
import { buildListParams, type ListQuery } from "@/lib/api/query";
import type { PaginatedResponse, TaskStatus } from "@/types/api";

export type TaskDepartment = "UI_UX" | "FRONTEND" | "BACKEND";

export type TaskAssignee = {
  id: string;
  name: string;
  email: string;
  departmentId?: string | null;
};

export type TaskRecord = {
  id: string;
  projectId: string;
  title: string;
  description?: string | null;
  status: TaskStatus;
  version?: number;
  department?: TaskDepartment;
  assigneeId?: string | null;
  createdById?: string;
  isClientVisible?: boolean;
  createdAt?: string;
  updatedAt: string;
  assignee?: TaskAssignee | null;
  project?: {
    id: string;
    name: string;
    clientId?: string;
  } | null;
};

export type TaskDetailRecord = Omit<TaskRecord, "projectId"> & {
  projectId?: string;
  dependencies?: Array<{
    id?: string;
    dependsOnTaskId?: string;
    dependsOnTask?: {
      id: string;
      title: string;
      status: TaskStatus;
    };
  }>;
};

export type CreateTaskPayload = {
  projectId: string;
  title: string;
  description?: string;
  department: TaskDepartment;
  assigneeId?: string;
  isClientVisible?: boolean;
};

export type UpdateTaskPayload = {
  title?: string;
  description?: string;
  department?: TaskDepartment;
  assigneeId?: string | null;
  isClientVisible?: boolean;
  version: number;
};

export type TaskDependencyItem = {
  id: string;
  title: string;
  status: TaskStatus;
  department?: TaskDepartment;
};

export async function getTasks(query: ListQuery = {}) {
  const response = await api.get<PaginatedResponse<TaskRecord>>("/tasks", {
    params: buildListParams(query),
  });

  return response.data;
}

export async function getTaskById(taskId: string) {
  const response = await api.get<{
    message: string;
    data: TaskDetailRecord;
  }>(`/tasks/${taskId}`);

  return response.data.data;
}

export async function createTask(payload: CreateTaskPayload) {
  const response = await api.post<{
    message: string;
    data: TaskRecord;
  }>("/tasks", payload);

  return response.data.data;
}

export async function updateTask(taskId: string, payload: UpdateTaskPayload) {
  const response = await api.patch<{
    message: string;
    data: TaskRecord;
  }>(`/tasks/${taskId}`, payload);

  return response.data.data;
}

export async function deleteTask(taskId: string, version: number) {
  const response = await api.delete<{
    message: string;
    data: {
      id: string;
      version: number;
      deletedAt: string;
    };
  }>(`/tasks/${taskId}`, {
    data: { version },
  });

  return response.data.data;
}

export async function changeTaskStatus(
  taskId: string,
  status: TaskStatus,
  version: number,
) {
  const response = await api.patch<{
    message: string;
    data: TaskRecord;
  }>(`/tasks/${taskId}/status`, {
    status,
    version,
  });

  return response.data.data;
}

export async function getTaskDependencies(
  taskId: string,
  query: ListQuery = {},
) {
  const response = await api.get<PaginatedResponse<TaskDependencyItem>>(
    `/tasks/${taskId}/dependencies`,
    {
      params: buildListParams(query),
    },
  );

  return response.data;
}

export async function addTaskDependency(
  taskId: string,
  dependsOnTaskId: string,
) {
  const response = await api.post<{
    message: string;
    data: unknown;
  }>(`/tasks/${taskId}/dependencies`, {
    dependsOnTaskId,
  });

  return response.data.data;
}

export async function removeTaskDependency(
  taskId: string,
  dependsOnTaskId: string,
) {
  const response = await api.delete<{
    message: string;
    data: {
      taskId: string;
      dependsOnTaskId: string;
    };
  }>(`/tasks/${taskId}/dependencies/${dependsOnTaskId}`);

  return response.data.data;
}

