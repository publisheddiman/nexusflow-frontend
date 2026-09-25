"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { Check, ListChecks, Save, X } from "lucide-react";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getProjectById, type ProjectRecord } from "@/lib/api/projects";
import {
  createTask,
  type TaskDepartment,
  type TaskDetailRecord,
  updateTask,
} from "@/lib/api/tasks";

const taskFormSchema = z.object({
  projectId: z.string().trim().min(1, "Project is required."),
  title: z
    .string()
    .trim()
    .min(1, "Task title is required.")
    .max(255, "Task title must not exceed 255 characters."),
  description: z.string(),
  department: z.enum(["UI_UX", "FRONTEND", "BACKEND"]),
  assigneeId: z.string(),
  isClientVisible: z.boolean(),
});

type TaskFormValues = z.infer<typeof taskFormSchema>;

type Props = {
  mode: "create" | "edit";
  task?: TaskDetailRecord | null;
  projects: ProjectRecord[];
  defaultProjectId?: string;
  onClose: () => void;
  onSaved: () => void | Promise<void>;
};

const DEPARTMENTS: Array<{
  value: TaskDepartment;
  label: string;
}> = [
  {
    value: "UI_UX",
    label: "UI / UX",
  },
  {
    value: "FRONTEND",
    label: "Frontend",
  },
  {
    value: "BACKEND",
    label: "Backend",
  },
];

function getApiMessage(error: unknown) {
  if (
    axios.isAxiosError(error) &&
    typeof error.response?.data?.message === "string"
  ) {
    return error.response.data.message;
  }

  return "Unable to save task.";
}

export function TaskFormModal({
  mode,
  task,
  projects,
  defaultProjectId = "",
  onClose,
  onSaved,
}: Props) {
  const isEdit = mode === "edit";

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<TaskFormValues>({
    resolver: zodResolver(taskFormSchema),
    defaultValues: {
      projectId: defaultProjectId,
      title: "",
      description: "",
      department: "FRONTEND",
      assigneeId: "",
      isClientVisible: false,
    },
  });

  useEffect(() => {
    reset({
      projectId: task?.projectId ?? task?.project?.id ?? defaultProjectId,
      title: task?.title ?? "",
      description: task?.description ?? "",
      department: task?.department ?? "FRONTEND",
      assigneeId: task?.assigneeId ?? "",
      isClientVisible: task?.isClientVisible ?? false,
    });
  }, [task, defaultProjectId, reset]);

  const selectedProjectId = watch("projectId");

  const projectQuery = useQuery({
    queryKey: ["task-form-project", selectedProjectId],
    enabled: Boolean(selectedProjectId),
    queryFn: () => getProjectById(selectedProjectId),
  });

  const members = projectQuery.data?.members ?? [];

  async function submit(values: TaskFormValues) {
    try {
      if (isEdit && task) {
        if (!task.version) {
          setError("root", {
            message:
              "Task version is unavailable. Refresh the task and try again.",
          });
          return;
        }

        await updateTask(task.id, {
          title: values.title,
          description: values.description,
          department: values.department,
          assigneeId: values.assigneeId || null,
          isClientVisible: values.isClientVisible,
          version: task.version,
        });
      } else {
        await createTask({
          projectId: values.projectId,
          title: values.title,
          description: values.description || undefined,
          department: values.department,
          assigneeId: values.assigneeId || undefined,
          isClientVisible: values.isClientVisible,
        });
      }

      await onSaved();
      onClose();
    } catch (error) {
      setError("root", {
        message: getApiMessage(error),
      });
    }
  }

  return (
    <div className="fixed inset-0 z-[10030] flex items-center justify-center bg-slate-950/45 p-4 backdrop-blur-sm">
      <button
        type="button"
        className="absolute inset-0"
        aria-label="Close task form"
        onClick={onClose}
      />

      <form
        onSubmit={handleSubmit(submit)}
        className="relative z-10 max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-[24px] border border-slate-200 bg-white shadow-[0_28px_90px_rgba(15,23,42,0.3)]"
      >
        <div className="sticky top-0 z-10 flex items-start justify-between border-b border-slate-100 bg-white px-5 py-4">
          <div className="flex gap-3">
            <div className="flex size-10 items-center justify-center rounded-xl bg-cyan-50 text-cyan-600">
              {isEdit ? (
                <Save className="size-4" />
              ) : (
                <ListChecks className="size-4" />
              )}
            </div>

            <div>
              <h2 className="text-base font-semibold text-slate-900">
                {isEdit ? "Edit task" : "New task"}
              </h2>
              <p className="mt-1 text-xs text-slate-500">
                {isEdit
                  ? "Update task definition, assignment, and client visibility."
                  : "Create a task inside a project workspace."}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
            aria-label="Close"
          >
            <X className="size-4" />
          </button>
        </div>

        <div className="space-y-5 p-5">
          <div>
            <label
              htmlFor="task-project"
              className="mb-1.5 block text-xs font-semibold text-slate-600"
            >
              Project
            </label>

            <select
              id="task-project"
              disabled={isEdit}
              className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-800 outline-none transition disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-500 focus:border-cyan-400 focus:ring-4 focus:ring-cyan-500/10"
              {...register("projectId")}
            >
              <option value="">Select project</option>

              {projects.map((project) => (
                <option key={project.id} value={project.id}>
                  {project.name}
                </option>
              ))}
            </select>

            {errors.projectId && (
              <p className="mt-1.5 text-xs text-red-600">
                {errors.projectId.message}
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="task-title"
              className="mb-1.5 block text-xs font-semibold text-slate-600"
            >
              Task title
            </label>

            <Input
              id="task-title"
              placeholder="e.g. Implement authentication flow"
              {...register("title")}
            />

            {errors.title && (
              <p className="mt-1.5 text-xs text-red-600">
                {errors.title.message}
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="task-description"
              className="mb-1.5 block text-xs font-semibold text-slate-600"
            >
              Description
            </label>

            <textarea
              id="task-description"
              rows={4}
              placeholder="Describe the expected delivery..."
              className="w-full resize-none rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-cyan-400 focus:ring-4 focus:ring-cyan-500/10"
              {...register("description")}
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label
                htmlFor="task-department"
                className="mb-1.5 block text-xs font-semibold text-slate-600"
              >
                Department
              </label>

              <select
                id="task-department"
                className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-800 outline-none transition focus:border-cyan-400 focus:ring-4 focus:ring-cyan-500/10"
                {...register("department")}
              >
                {DEPARTMENTS.map((department) => (
                  <option key={department.value} value={department.value}>
                    {department.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label
                htmlFor="task-assignee"
                className="mb-1.5 block text-xs font-semibold text-slate-600"
              >
                Assignee
              </label>

              <select
                id="task-assignee"
                disabled={!selectedProjectId || projectQuery.isPending}
                className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-800 outline-none transition disabled:bg-slate-50 focus:border-cyan-400 focus:ring-4 focus:ring-cyan-500/10"
                {...register("assigneeId")}
              >
                <option value="">Unassigned</option>

                {members.map((member) => (
                  <option key={member.user.id} value={member.user.id}>
                    {member.user.name} Â· {member.user.email}
                  </option>
                ))}
              </select>

              <p className="mt-1.5 text-[11px] leading-5 text-slate-400">
                Assignment is validated by the backend against project
                membership and department.
              </p>
            </div>
          </div>

          <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-slate-200 bg-slate-50/70 p-3">
            <input
              type="checkbox"
              className="mt-0.5 size-4 rounded border-slate-300 accent-cyan-600"
              {...register("isClientVisible")}
            />

            <span>
              <span className="block text-xs font-semibold text-slate-700">
                Visible to client
              </span>
              <span className="mt-1 block text-[11px] leading-5 text-slate-400">
                Client users can only receive tasks explicitly marked as
                client-visible.
              </span>
            </span>
          </label>

          {errors.root?.message && (
            <div className="rounded-xl border border-red-200 bg-red-50 px-3 py-2.5 text-xs text-red-700">
              {errors.root.message}
            </div>
          )}
        </div>

        <div className="sticky bottom-0 flex justify-end gap-2 border-t border-slate-100 bg-white px-5 py-4">
          <Button
            type="button"
            variant="outline"
            disabled={isSubmitting}
            onClick={onClose}
          >
            Cancel
          </Button>

          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? (
              "Saving..."
            ) : (
              <>
                <Check className="size-4" />
                {isEdit ? "Save changes" : "Create task"}
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
