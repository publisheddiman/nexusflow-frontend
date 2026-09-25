"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  ArrowLeft,
  CheckCircle2,
  CircleDashed,
  FolderKanban,
  Pencil,
  Trash2,
  TriangleAlert,
  Users,
  X,
} from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { ProjectFormModal } from "@/components/projects/project-form-modal";
import { Button } from "@/components/ui/button";
import {
  deleteProject,
  getProjectById,
  getProjects,
  type ProjectPerson,
} from "@/lib/api/projects";
import { getTasks } from "@/lib/api/tasks";
import { useAuthStore } from "@/stores/auth-store";

function uniquePeople(people: ProjectPerson[]) {
  return Array.from(
    new Map(people.map((person) => [person.id, person])).values(),
  );
}

function formatDate(value?: string) {
  if (!value) return "—";
  return new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

export default function ProjectDetailPage() {
  const params = useParams<{ id: string }>();
  const id = params.id;
  const user = useAuthStore((state) => state.user);
  const router = useRouter();
  const queryClient = useQueryClient();

  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState("");

  const projectQuery = useQuery({
    queryKey: ["project", id],
    queryFn: () => getProjectById(id),
  });

  const tasksQuery = useQuery({
    queryKey: ["project-tasks", id],
    queryFn: () =>
      getTasks({
        page: 1,
        rows: 100,
        filters: { projectId: id },
        orderKey: "updatedAt",
        orderRule: "desc",
      }),
  });

  const projectOptionsQuery = useQuery({
    queryKey: ["projects", "form-options"],
    enabled: user?.role === "PM",
    queryFn: () =>
      getProjects({
        page: 1,
        rows: 100,
        orderKey: "createdAt",
        orderRule: "desc",
      }),
  });

  if (!user) return null;

  const project = projectQuery.data ?? null;
  const tasks = tasksQuery.data?.data ?? [];

  const completed = tasks.filter((task) => task.status === "DONE").length;
  const blocked = tasks.filter((task) => task.status === "BLOCKED").length;
  const inProgress = tasks.filter(
    (task) => task.status === "IN_PROGRESS",
  ).length;
  const progress =
    tasks.length === 0 ? 0 : Math.round((completed / tasks.length) * 100);

  const optionProjects = projectOptionsQuery.data?.data ?? [];
  const clients = uniquePeople([
    ...(project?.client ? [project.client] : []),
    ...optionProjects
      .map((item) => item.client)
      .filter((client): client is ProjectPerson => Boolean(client)),
  ]);
  const members = uniquePeople([
    ...(project?.members?.map((member) => member.user) ?? []),
    ...optionProjects.flatMap(
      (item) => item.members?.map((member) => member.user) ?? [],
    ),
  ]);

  async function refreshProject() {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ["project", id] }),
      queryClient.invalidateQueries({ queryKey: ["projects"] }),
      queryClient.invalidateQueries({ queryKey: ["tasks"] }),
    ]);
  }

  async function confirmDelete() {
    setDeleting(true);
    setDeleteError("");

    try {
      await deleteProject(id);
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["projects"] }),
        queryClient.invalidateQueries({ queryKey: ["tasks"] }),
      ]);
      router.replace("/projects");
    } catch {
      setDeleteError("Unable to delete project.");
      setDeleting(false);
    }
  }

  return (
    <div className="px-5 py-7 sm:px-7 lg:px-9 lg:py-8">
      <div className="mx-auto max-w-[1500px]">
        <div className="mb-5 flex items-center justify-between gap-3">
          <Button asChild variant="outline" size="sm">
            <Link href="/projects">
              <ArrowLeft className="size-4" />
              Projects
            </Link>
          </Button>

          {user.role === "PM" && project && (
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setEditOpen(true)}
              >
                <Pencil className="size-4" />
                Edit
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700"
                onClick={() => setDeleteOpen(true)}
              >
                <Trash2 className="size-4" />
                Delete
              </Button>
            </div>
          )}
        </div>

        {projectQuery.isPending ? (
          <div className="rounded-[22px] border border-slate-200 bg-white p-10 text-center text-sm text-slate-500 shadow-sm">
            Loading project...
          </div>
        ) : projectQuery.isError || !project ? (
          <div className="rounded-[22px] border border-red-200 bg-red-50 p-5 text-sm text-red-700">
            Project could not be loaded or is not accessible.
          </div>
        ) : (
          <>
            <section className="overflow-hidden rounded-[24px] border border-slate-200/80 bg-white shadow-sm">
              <div className="border-b border-slate-100 bg-gradient-to-r from-cyan-50/80 via-white to-blue-50/50 p-6 sm:p-7">
                <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                  <div className="flex min-w-0 gap-4">
                    <div className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-cyan-600 text-white shadow-[0_12px_30px_rgba(8,145,178,0.22)]">
                      <FolderKanban className="size-5" />
                    </div>

                    <div className="min-w-0">
                      <div className="text-[10px] font-extrabold tracking-[0.16em] text-cyan-600">
                        PROJECT DETAIL
                      </div>
                      <h1 className="mt-2 text-2xl font-semibold tracking-[-0.04em] text-slate-950 sm:text-3xl">
                        {project.name}
                      </h1>
                      <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-500">
                        {project.description ||
                          "No project description provided."}
                      </p>
                    </div>
                  </div>

                  <div className="min-w-[180px] rounded-2xl border border-white bg-white/80 p-4 shadow-sm">
                    <div className="flex items-end justify-between gap-3">
                      <div>
                        <div className="text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400">
                          Completion
                        </div>
                        <div className="mt-1 text-2xl font-semibold text-slate-950">
                          {tasksQuery.isPending ? "â€”" : `${progress}%`}
                        </div>
                      </div>
                      <CheckCircle2 className="size-5 text-emerald-500" />
                    </div>
                    <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-slate-100">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-blue-600"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {user.role !== "CLIENT" && (
                <div className="grid gap-0 border-b border-slate-100 md:grid-cols-2">
                  <div className="border-b border-slate-100 p-5 md:border-b-0 md:border-r">
                    <div className="text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400">
                      Client
                    </div>
                    <div className="mt-2 text-sm font-semibold text-slate-800">
                      {project.client?.name ?? "Unassigned"}
                    </div>
                    {project.client?.email && (
                      <div className="mt-1 text-xs text-slate-400">
                        {project.client.email}
                      </div>
                    )}
                  </div>

                  <div className="p-5">
                    <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400">
                      <Users className="size-3.5" />
                      Internal team
                    </div>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {project.members && project.members.length > 0 ? (
                        project.members.map((member) => (
                          <span
                            key={member.id}
                            className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-medium text-slate-600"
                          >
                            {member.user.name}
                          </span>
                        ))
                      ) : (
                        <span className="text-xs text-slate-400">
                          No internal members assigned.
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              )}

              <div className="flex flex-wrap gap-x-6 gap-y-2 px-6 py-4 text-[11px] text-slate-400">
                <span>Created {formatDate(project.createdAt)}</span>
                <span>Updated {formatDate(project.updatedAt)}</span>
              </div>
            </section>

            <section className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              {[
                {
                  label: "Total Tasks",
                  value: tasks.length,
                  icon: CircleDashed,
                  className: "bg-slate-50 text-slate-600",
                },
                {
                  label: "In Progress",
                  value: inProgress,
                  icon: CircleDashed,
                  className: "bg-blue-50 text-blue-600",
                },
                {
                  label: "Completed",
                  value: completed,
                  icon: CheckCircle2,
                  className: "bg-emerald-50 text-emerald-600",
                },
                {
                  label: "Blocked",
                  value: blocked,
                  icon: TriangleAlert,
                  className: "bg-amber-50 text-amber-600",
                },
              ].map(({ label, value, icon: Icon, className }) => (
                <div
                  key={label}
                  className="rounded-[18px] border border-slate-200/80 bg-white p-4 shadow-sm"
                >
                  <div
                    className={`flex size-9 items-center justify-center rounded-xl ${className}`}
                  >
                    <Icon className="size-4" />
                  </div>
                  <div className="mt-3 text-xs text-slate-500">{label}</div>
                  <div className="mt-1 text-2xl font-semibold text-slate-950">
                    {tasksQuery.isPending ? "â€”" : value}
                  </div>
                </div>
              ))}
            </section>

            <section className="mt-4 rounded-[22px] border border-slate-200/80 bg-white shadow-sm">
              <div className="flex flex-col gap-3 border-b border-slate-100 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <div className="text-[10px] font-extrabold tracking-[0.16em] text-cyan-600">
                    PROJECT WORK
                  </div>
                  <h2 className="mt-1 text-base font-semibold text-slate-900">
                    Project Tasks
                  </h2>
                </div>

                <Button asChild variant="outline" size="sm">
                  <Link href={`/tasks?project=${project.id}`}>
                    Open task board
                  </Link>
                </Button>
              </div>

              <div className="p-4">
                {tasksQuery.isPending ? (
                  <div className="py-8 text-center text-sm text-slate-500">
                    Loading tasks...
                  </div>
                ) : tasks.length === 0 ? (
                  <div className="py-10 text-center text-sm text-slate-500">
                    No tasks are available for this project.
                  </div>
                ) : (
                  <div className="divide-y divide-slate-100">
                    {tasks.slice(0, 8).map((task) => (
                      <Link
                        key={task.id}
                        href={`/tasks?task=${task.id}`}
                        className="flex items-center justify-between gap-4 rounded-xl px-2 py-3 transition hover:bg-slate-50"
                      >
                        <div className="min-w-0">
                          <div className="truncate text-sm font-semibold text-slate-800">
                            {task.title}
                          </div>
                          <div className="mt-1 text-[11px] text-slate-400">
                            Updated {formatDate(task.updatedAt)}
                          </div>
                        </div>

                        <span
                          className={`shrink-0 rounded-full px-2.5 py-1 text-[10px] font-bold ${
                            task.status === "DONE"
                              ? "bg-emerald-50 text-emerald-700"
                              : task.status === "BLOCKED"
                                ? "bg-amber-50 text-amber-700"
                                : task.status === "IN_PROGRESS"
                                  ? "bg-blue-50 text-blue-700"
                                  : "bg-slate-100 text-slate-600"
                          }`}
                        >
                          {task.status.replaceAll("_", " ")}
                        </span>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            </section>
          </>
        )}
      </div>

      {editOpen && project && user.role === "PM" && (
        <ProjectFormModal
          mode="edit"
          project={project}
          clients={clients}
          members={members}
          onClose={() => setEditOpen(false)}
          onSaved={refreshProject}
        />
      )}

      {deleteOpen && project && user.role === "PM" && (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-slate-950/45 p-4 backdrop-blur-sm">
          <button
            type="button"
            className="absolute inset-0"
            aria-label="Close delete confirmation"
            onClick={() => setDeleteOpen(false)}
          />

          <div className="relative z-10 w-full max-w-md rounded-[22px] border border-slate-200 bg-white shadow-2xl">
            <div className="flex items-start justify-between border-b border-slate-100 p-5">
              <div>
                <h2 className="text-base font-semibold text-slate-900">
                  Delete project?
                </h2>
                <p className="mt-1 text-xs leading-5 text-slate-500">
                  This performs a soft delete. The project and active tasks will
                  no longer appear in the workspace.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setDeleteOpen(false)}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100"
              >
                <X className="size-4" />
              </button>
            </div>

            <div className="p-5">
              <div className="rounded-xl border border-red-100 bg-red-50 px-3 py-3 text-sm font-semibold text-red-700">
                {project.name}
              </div>

              {deleteError && (
                <div className="mt-3 text-xs text-red-600">{deleteError}</div>
              )}

              <div className="mt-5 flex justify-end gap-2">
                <Button
                  variant="outline"
                  disabled={deleting}
                  onClick={() => setDeleteOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  disabled={deleting}
                  className="bg-red-600 text-white hover:bg-red-700"
                  onClick={() => void confirmDelete()}
                >
                  <Trash2 className="size-4" />
                  {deleting ? "Deleting..." : "Delete project"}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
