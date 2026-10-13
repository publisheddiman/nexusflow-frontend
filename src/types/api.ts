export type UserRole = "PM" | "INTERNAL" | "CLIENT";

export type User = {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  department?: string | null;
  avatarUrl?: string | null;
};

export type ApiResponse<T> = {
  success?: boolean;
  message?: string;
  data: T;
};

export type LoginResponse = {
  token: string;
  user: User;
};

export type Pagination = {
  page: number;
  rows: number;
  totalData: number;
  totalPage: number;
};

export type TaskStatus = "TODO" | "IN_PROGRESS" | "BLOCKED" | "DONE";

export type Project = {
  id: string;
  name: string;
  description?: string | null;
  createdAt: string;
  updatedAt?: string;
};

export type Task = {
  id: string;
  title: string;
  description?: string | null;
  status: TaskStatus;
  projectId: string;
  createdAt?: string;
  updatedAt: string;
  project?: {
    id: string;
    name: string;
  } | null;
};

export type PaginatedResponse<T> = {
  message?: string;
  data: T[];
  pagination: Pagination;
};

