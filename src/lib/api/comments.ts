import { api } from "@/lib/api/client";
import { buildListParams, type ListQuery } from "@/lib/api/query";
import type { PaginatedResponse, UserRole } from "@/types/api";

export type CommentAuthor = {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  departmentId?: string | null;
};

export type CommentRecord = {
  id: string;
  taskId: string;
  content: string;
  createdAt: string;
  updatedAt: string;
  user: CommentAuthor;
};

export async function getComments(taskId: string, query: ListQuery = {}) {
  const response = await api.get<PaginatedResponse<CommentRecord>>(
    `/tasks/${taskId}/comments`,
    {
      params: buildListParams(query),
    },
  );

  return response.data;
}

export async function createComment(taskId: string, content: string) {
  const response = await api.post<{
    message: string;
    data: CommentRecord;
  }>(`/tasks/${taskId}/comments`, {
    content,
  });

  return response.data.data;
}

export async function updateComment(
  taskId: string,
  commentId: string,
  content: string,
) {
  const response = await api.patch<{
    message: string;
    data: CommentRecord;
  }>(`/tasks/${taskId}/comments/${commentId}`, {
    content,
  });

  return response.data.data;
}

export async function deleteComment(taskId: string, commentId: string) {
  const response = await api.delete<{
    message: string;
    data: {
      id: string;
      deletedAt: string;
    };
  }>(`/tasks/${taskId}/comments/${commentId}`);

  return response.data.data;
}

