"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import axios from "axios";
import { Check, FolderPlus, Save, X } from "lucide-react";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  createProject,
  type ProjectPerson,
  type ProjectRecord,
  updateProject,
} from "@/lib/api/projects";

const projectFormSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Project name is required.")
    .max(255, "Project name must not exceed 255 characters."),
  description: z.string().trim(),
  clientId: z.string().trim().min(1, "Client is required."),
  memberIds: z.array(z.string()),
});

type ProjectFormValues = z.infer<typeof projectFormSchema>;

type ProjectFormModalProps = {
  mode: "create" | "edit";
  project?: ProjectRecord | null;
  clients: ProjectPerson[];
  members: ProjectPerson[];
  onClose: () => void;
  onSaved: () => void | Promise<void>;
};

function getApiMessage(error: unknown) {
  if (
    axios.isAxiosError(error) &&
    typeof error.response?.data?.message === "string"
  ) {
    return error.response.data.message;
  }

  return "Unable to save project.";
}

export function ProjectFormModal({
  mode,
  project,
  clients,
  members,
  onClose,
  onSaved,
}: ProjectFormModalProps) {
  const isEdit = mode === "edit";

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
    setError,
  } = useForm<ProjectFormValues>({
    resolver: zodResolver(projectFormSchema),
    defaultValues: {
      name: "",
      description: "",
      clientId: "",
      memberIds: [],
    },
  });

  useEffect(() => {
    reset({
      name: project?.name ?? "",
      description: project?.description ?? "",
      clientId: project?.clientId ?? "",
      memberIds: project?.members?.map((member) => member.userId) ?? [],
    });
  }, [project, reset]);

  async function submit(values: ProjectFormValues) {
    try {
      if (isEdit && project) {
        await updateProject(project.id, {
          name: values.name,
          description: values.description || null,
          clientId: values.clientId,
          memberIds: values.memberIds,
        });
      } else {
        await createProject({
          name: values.name,
          description: values.description,
          clientId: values.clientId,
          memberIds: values.memberIds,
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
    <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-slate-950/45 p-4 backdrop-blur-sm">
      <button
        type="button"
        className="absolute inset-0"
        aria-label="Close project form"
        onClick={onClose}
      />

      <form
        onSubmit={handleSubmit(submit)}
        className="relative z-10 max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-[24px] border border-slate-200 bg-white shadow-[0_28px_90px_rgba(15,23,42,0.28)]"
      >
        <div className="sticky top-0 z-10 flex items-start justify-between border-b border-slate-100 bg-white px-5 py-4">
          <div className="flex gap-3">
            <div className="flex size-10 items-center justify-center rounded-xl bg-cyan-50 text-cyan-600">
              {isEdit ? (
                <Save className="size-4" />
              ) : (
                <FolderPlus className="size-4" />
              )}
            </div>
            <div>
              <h2 className="text-base font-semibold text-slate-900">
                {isEdit ? "Edit project" : "New project"}
              </h2>
              <p className="mt-1 text-xs text-slate-500">
                {isEdit
                  ? "Update project information, client, and assigned team."
                  : "Create a project and assign its client and internal team."}
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
              htmlFor="project-name"
              className="mb-1.5 block text-xs font-semibold text-slate-600"
            >
              Project name
            </label>
            <Input
              id="project-name"
              placeholder="e.g. NexusFlow Client Portal"
              {...register("name")}
            />
            {errors.name && (
              <p className="mt-1.5 text-xs text-red-600">
                {errors.name.message}
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="project-description"
              className="mb-1.5 block text-xs font-semibold text-slate-600"
            >
              Description
            </label>
            <textarea
              id="project-description"
              rows={4}
              placeholder="Describe the project scope and delivery objective..."
              className="w-full resize-none rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-cyan-400 focus:ring-4 focus:ring-cyan-500/10"
              {...register("description")}
            />
          </div>

          <div>
            <label
              htmlFor="project-client"
              className="mb-1.5 block text-xs font-semibold text-slate-600"
            >
              Client
            </label>

            {clients.length > 0 ? (
              <select
                id="project-client"
                className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-800 outline-none transition focus:border-cyan-400 focus:ring-4 focus:ring-cyan-500/10"
                {...register("clientId")}
              >
                <option value="">Select client</option>
                {clients.map((client) => (
                  <option key={client.id} value={client.id}>
                    {client.name} · {client.email}
                  </option>
                ))}
              </select>
            ) : (
              <Input
                id="project-client"
                placeholder="Client user ID"
                {...register("clientId")}
              />
            )}

            {errors.clientId && (
              <p className="mt-1.5 text-xs text-red-600">
                {errors.clientId.message}
              </p>
            )}

            {clients.length === 0 && (
              <p className="mt-1.5 text-[11px] leading-5 text-slate-400">
                No client identity could be discovered from existing projects.
                Enter a valid CLIENT user ID.
              </p>
            )}
          </div>

          <div>
            <div className="mb-2">
              <div className="text-xs font-semibold text-slate-600">
                Internal team
              </div>
              <div className="mt-1 text-[11px] text-slate-400">
                Select the internal users assigned to this project.
              </div>
            </div>

            {members.length > 0 ? (
              <div className="grid gap-2 sm:grid-cols-2">
                {members.map((member) => (
                  <label
                    key={member.id}
                    className="flex cursor-pointer items-start gap-3 rounded-xl border border-slate-200 p-3 transition hover:border-cyan-200 hover:bg-cyan-50/30"
                  >
                    <input
                      type="checkbox"
                      value={member.id}
                      className="mt-0.5 size-4 rounded border-slate-300 accent-cyan-600"
                      {...register("memberIds")}
                    />
                    <span className="min-w-0">
                      <span className="block truncate text-xs font-semibold text-slate-700">
                        {member.name}
                      </span>
                      <span className="mt-0.5 block truncate text-[11px] text-slate-400">
                        {member.email}
                      </span>
                    </span>
                  </label>
                ))}
              </div>
            ) : (
              <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 px-4 py-5 text-center text-xs text-slate-500">
                No internal member options were found. You can still create the
                project without team members and assign them later.
              </div>
            )}
          </div>

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
                {isEdit ? "Save changes" : "Create project"}
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}

