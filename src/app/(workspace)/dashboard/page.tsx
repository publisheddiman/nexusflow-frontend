"use client";

import { useQuery } from "@tanstack/react-query";
import {
  CheckCircle2,
  CircleDashed,
  Clock3,
  FolderKanban,
  Gauge,
  ShieldCheck,
  TriangleAlert,
  Workflow,
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { getProjects } from "@/lib/api/projects";
import { getTasks } from "@/lib/api/tasks";
import { useAuthStore } from "@/stores/auth-store";
import type { Project, Task } from "@/types/api";

function formatStatus(status: Task["status"]) {
  return status
    .replaceAll("_", " ")
    .toLowerCase()
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function formatTime(value: string) {
  return new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function projectTasks(project: Project, tasks: Task[]) {
  return tasks.filter((task) => task.projectId === project.id);
}

function projectProgress(project: Project, tasks: Task[]) {
  const scoped = projectTasks(project, tasks);

  if (scoped.length === 0) return 0;

  const done = scoped.filter((task) => task.status === "DONE").length;
  return Math.round((done / scoped.length) * 100);
}

function LoadingCard() {
  return (
    <Card className="border-slate-200/80 bg-white shadow-sm">
      <CardContent className="p-4">
        <div className="animate-pulse">
          <div className="h-9 w-9 rounded-xl bg-slate-100" />
          <div className="mt-3 h-3 w-24 rounded bg-slate-100" />
          <div className="mt-2 h-6 w-12 rounded bg-slate-100" />
        </div>
      </CardContent>
    </Card>
  );
}

export default function DashboardPage() {
  const user = useAuthStore((state) => state.user);

  const projectsQuery = useQuery({
    queryKey: ["projects", "dashboard"],
    queryFn: () =>
      getProjects({
        page: 1,
        rows: 50,
        orderKey: "createdAt",
        orderRule: "desc",
      }),
  });

  const tasksQuery = useQuery({
    queryKey: ["tasks", "dashboard"],
    queryFn: () =>
      getTasks({
        page: 1,
        rows: 100,
        orderKey: "updatedAt",
        orderRule: "desc",
      }),
  });

  if (!user) return null;

  const projects = projectsQuery.data?.data ?? [];
  const tasks = tasksQuery.data?.data ?? [];
  const loading = projectsQuery.isPending || tasksQuery.isPending;
  const hasError = projectsQuery.isError || tasksQuery.isError;
  const isClient = user.role === "CLIENT";

  const todo = tasks.filter((task) => task.status === "TODO").length;
  const inProgress = tasks.filter(
    (task) => task.status === "IN_PROGRESS",
  ).length;
  const blocked = tasks.filter((task) => task.status === "BLOCKED").length;
  const completed = tasks.filter((task) => task.status === "DONE").length;
  const open = tasks.length - completed;
  const completionRate =
    tasks.length === 0 ? 0 : Math.round((completed / tasks.length) * 100);

  const latestProject = projects[0] ?? null;
  const latestProjectTasks = latestProject
    ? projectTasks(latestProject, tasks)
    : [];
  const latestCompleted = latestProjectTasks.filter(
    (task) => task.status === "DONE",
  ).length;
  const latestBlocked = latestProjectTasks.filter(
    (task) => task.status === "BLOCKED",
  ).length;
  const latestProgress = latestProject
    ? projectProgress(latestProject, tasks)
    : 0;

  const recentTasks = [...tasks]
    .sort(
      (a, b) =>
        new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
    )
    .slice(0, 4);

  function taskPercent(value: number) {
    if (tasks.length === 0) return 0;
    return Math.round((value / tasks.length) * 100);
  }

  function retry() {
    void projectsQuery.refetch();
    void tasksQuery.refetch();
  }

  if (isClient) {
    return (
      <div className="px-4 py-4 sm:px-5 lg:px-6">
        <div className="mx-auto max-w-[1400px]">
          <section className="rounded-[20px] border border-slate-200/80 bg-white px-6 py-5 shadow-sm">
            <div className="text-[10px] font-extrabold tracking-[0.16em] text-cyan-600">
              CLIENT DELIVERY OVERVIEW
            </div>

            <div className="mt-2 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <h1 className="text-[30px] font-semibold tracking-[-0.04em] text-[#10233c]">
                  Project delivery overview
                </h1>
                <p className="mt-1.5 max-w-2xl text-sm leading-6 text-slate-500">
                  Track aggregate delivery progress for your assigned project.
                </p>
              </div>

              <div className="inline-flex w-fit items-center gap-2 rounded-full border border-cyan-200 bg-cyan-50 px-3 py-1.5 text-xs font-semibold text-cyan-700">
                <ShieldCheck className="size-3.5" />
                Client-safe view
              </div>
            </div>
          </section>

          {hasError && (
            <div className="mt-3 flex items-center justify-between rounded-2xl border border-red-200 bg-red-50 px-4 py-3">
              <div>
                <div className="text-sm font-semibold text-red-800">
                  Unable to load workspace
                </div>
                <div className="mt-0.5 text-xs text-red-600">
                  Delivery data could not be retrieved.
                </div>
              </div>
              <Button size="sm" variant="outline" onClick={retry}>
                Retry
              </Button>
            </div>
          )}

          <section className="mt-3 grid gap-3 md:grid-cols-3">
            {loading ? (
              <>
                <LoadingCard />
                <LoadingCard />
                <LoadingCard />
              </>
            ) : (
              <>
                <Card className="border-slate-200/80 bg-white shadow-sm">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="flex size-10 items-center justify-center rounded-xl bg-sky-50 text-sky-600">
                        <FolderKanban className="size-[18px]" />
                      </div>
                      <div>
                        <div className="text-xs text-slate-500">
                          Assigned Projects
                        </div>
                        <div className="mt-0.5 text-2xl font-semibold text-slate-950">
                          {projects.length}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-slate-200/80 bg-white shadow-sm">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="flex size-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                        <CheckCircle2 className="size-[18px]" />
                      </div>
                      <div>
                        <div className="text-xs text-slate-500">
                          Completed Milestones
                        </div>
                        <div className="mt-0.5 text-2xl font-semibold text-slate-950">
                          {completed}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-slate-200/80 bg-white shadow-sm">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="flex size-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                        <Gauge className="size-[18px]" />
                      </div>
                      <div>
                        <div className="text-xs text-slate-500">
                          Overall Completion
                        </div>
                        <div className="mt-0.5 text-2xl font-semibold text-slate-950">
                          {completionRate}%
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </>
            )}
          </section>

          <Card className="mt-3 border-slate-200/80 bg-white shadow-sm">
            <CardHeader className="border-b border-slate-100 px-5 py-3.5">
              <div>
                <div className="text-[10px] font-extrabold tracking-[0.15em] text-cyan-600">
                  DELIVERY PROGRESS
                </div>
                <h2 className="mt-1 text-base font-semibold text-slate-900">
                  Project Progress
                </h2>
              </div>
            </CardHeader>

            <CardContent className="p-4">
              {loading ? (
                <div className="h-24 animate-pulse rounded-xl bg-slate-100" />
              ) : projects.length === 0 ? (
                <div className="py-8 text-center text-sm text-slate-500">
                  No project is currently available.
                </div>
              ) : (
                <div className="grid gap-3 xl:grid-cols-2">
                  {projects.map((project) => {
                    const scoped = projectTasks(project, tasks);
                    const progress = projectProgress(project, tasks);
                    const done = scoped.filter(
                      (task) => task.status === "DONE",
                    ).length;

                    return (
                      <article
                        key={project.id}
                        className="rounded-2xl border border-slate-200 bg-slate-50/60 p-4"
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <div className="text-[10px] font-bold tracking-[0.14em] text-cyan-600">
                              PROJECT
                            </div>
                            <h3 className="mt-1.5 font-semibold text-slate-900">
                              {project.name}
                            </h3>
                          </div>
                          <div className="text-xl font-semibold text-slate-950">
                            {progress}%
                          </div>
                        </div>

                        <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-slate-200">
                          <div
                            className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-blue-600"
                            style={{ width: `${progress}%` }}
                          />
                        </div>

                        <div className="mt-2 text-[11px] text-slate-500">
                          {done} of {scoped.length} visible milestones completed
                        </div>
                      </article>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const metrics = [
    {
      label: "Projects",
      value: projects.length,
      helper: "Accessible workspaces",
      icon: FolderKanban,
      iconClass: "bg-sky-50 text-sky-600",
    },
    {
      label: "Open Tasks",
      value: open,
      helper: "Awaiting completion",
      icon: CircleDashed,
      iconClass: "bg-blue-50 text-blue-600",
    },
    {
      label: "Blocked Tasks",
      value: blocked,
      helper: "Needs dependency attention",
      icon: TriangleAlert,
      iconClass: "bg-amber-50 text-amber-600",
    },
    {
      label: "Completed",
      value: completed,
      helper: `${completionRate}% completion rate`,
      icon: CheckCircle2,
      iconClass: "bg-emerald-50 text-emerald-600",
    },
  ];

  const distribution = [
    {
      label: "To Do",
      value: todo,
      percent: taskPercent(todo),
      bar: "bg-slate-400",
    },
    {
      label: "In Progress",
      value: inProgress,
      percent: taskPercent(inProgress),
      bar: "bg-sky-500",
    },
    {
      label: "Blocked",
      value: blocked,
      percent: taskPercent(blocked),
      bar: "bg-amber-500",
    },
    {
      label: "Done",
      value: completed,
      percent: taskPercent(completed),
      bar: "bg-emerald-500",
    },
  ];

  return (
    <div className="px-4 py-4 sm:px-5 lg:px-6">
      <div className="mx-auto max-w-[1400px]">
        <section className="rounded-[20px] border border-slate-200/80 bg-white px-6 py-5 shadow-sm sm:px-7">
          <div className="text-[10px] font-extrabold tracking-[0.16em] text-cyan-600">
            PROJECT OPERATIONS
          </div>

          <h1 className="mt-2.5 text-[32px] font-semibold leading-tight tracking-[-0.045em] text-[#10233c] sm:text-[38px]">
            Welcome back, {user.name}
          </h1>

          <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-500">
            Monitor delivery health, engineering workload, dependencies, and
            project progress from one workspace.
          </p>

          <div className="mt-3 flex flex-wrap gap-2">
            <div className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-[11px] font-semibold text-slate-600">
              <Gauge className="size-3.5 text-cyan-600" />
              {user.role === "PM"
                ? "Project Manager Workspace"
                : "Internal Team Workspace"}
            </div>

            <div className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-[11px] font-semibold text-slate-600">
              <Clock3 className="size-3.5 text-cyan-600" />
              {tasks.length} visible tasks
            </div>
          </div>
        </section>

        {hasError && (
          <div className="mt-3 flex items-center justify-between rounded-2xl border border-red-200 bg-red-50 px-4 py-3">
            <div>
              <div className="text-sm font-semibold text-red-800">
                Unable to load workspace
              </div>
              <div className="mt-0.5 text-xs text-red-600">
                The latest workspace data could not be retrieved.
              </div>
            </div>
            <Button size="sm" variant="outline" onClick={retry}>
              Retry
            </Button>
          </div>
        )}

        <section className="mt-3 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {loading
            ? [1, 2, 3, 4].map((item) => <LoadingCard key={item} />)
            : metrics.map(({ label, value, helper, icon: Icon, iconClass }) => (
                <Card
                  key={label}
                  className="border-slate-200/80 bg-gradient-to-br from-white to-sky-50/40 shadow-sm"
                >
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div
                        className={`flex size-10 shrink-0 items-center justify-center rounded-xl ${iconClass}`}
                      >
                        <Icon className="size-[18px]" />
                      </div>

                      <div className="min-w-0">
                        <div className="text-xs font-semibold text-slate-600">
                          {label}
                        </div>
                        <div className="mt-0.5 text-2xl font-semibold leading-none text-slate-950">
                          {value}
                        </div>
                        <div className="mt-1.5 truncate text-[10px] text-slate-400">
                          {helper}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
        </section>

        <section className="mt-3 grid gap-3 xl:grid-cols-[1.45fr_0.55fr]">
          <Card className="border-slate-200/80 bg-white shadow-sm">
            <CardHeader className="flex-row items-center justify-between border-b border-slate-100 px-5 py-3.5">
              <div>
                <div className="text-[10px] font-extrabold tracking-[0.16em] text-cyan-600">
                  DELIVERY OVERVIEW
                </div>
                <h2 className="mt-1 text-lg font-semibold text-slate-900">
                  Latest Project
                </h2>
              </div>

              {latestProject && (
                <Button asChild size="sm" variant="outline">
                  <Link href={`/projects/${latestProject.id}`}>
                    View project
                  </Link>
                </Button>
              )}
            </CardHeader>

            <CardContent className="p-4">
              {loading ? (
                <div className="h-44 animate-pulse rounded-2xl bg-slate-100" />
              ) : latestProject ? (
                <div className="rounded-2xl border border-slate-200 bg-slate-50/50 p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <div className="text-[10px] font-extrabold tracking-[0.14em] text-emerald-600">
                        ACTIVE DELIVERY
                      </div>
                      <h3 className="mt-1.5 truncate text-lg font-semibold text-slate-950">
                        {latestProject.name}
                      </h3>
                      {latestProject.description && (
                        <p className="mt-1.5 max-w-3xl text-xs leading-5 text-slate-500">
                          {latestProject.description}
                        </p>
                      )}
                    </div>

                    <div className="flex size-[68px] shrink-0 flex-col items-center justify-center rounded-2xl border border-sky-100 bg-sky-50">
                      <div className="text-xl font-semibold text-sky-700">
                        {latestProgress}%
                      </div>
                      <div className="mt-0.5 text-[9px] text-slate-500">
                        complete
                      </div>
                    </div>
                  </div>

                  <div className="mt-4">
                    <div className="mb-1.5 flex items-center justify-between text-[10px] text-slate-500">
                      <span>Delivery progress</span>
                      <strong className="text-slate-700">
                        {latestCompleted}/{latestProjectTasks.length} tasks
                      </strong>
                    </div>

                    <div className="h-1.5 overflow-hidden rounded-full bg-slate-200">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-blue-600"
                        style={{ width: `${latestProgress}%` }}
                      />
                    </div>
                  </div>

                  <div className="mt-3 grid gap-2 sm:grid-cols-4">
                    <div className="rounded-xl border border-slate-200 bg-white px-3 py-2.5">
                      <div className="text-[9px] text-slate-500">
                        Total tasks
                      </div>
                      <div className="mt-0.5 text-base font-semibold text-slate-950">
                        {latestProjectTasks.length}
                      </div>
                    </div>

                    <div className="rounded-xl border border-slate-200 bg-white px-3 py-2.5">
                      <div className="text-[9px] text-slate-500">Open</div>
                      <div className="mt-0.5 text-base font-semibold text-slate-950">
                        {latestProjectTasks.length - latestCompleted}
                      </div>
                    </div>

                    <div className="rounded-xl border border-slate-200 bg-white px-3 py-2.5">
                      <div className="text-[9px] text-slate-500">Completed</div>
                      <div className="mt-0.5 text-base font-semibold text-slate-950">
                        {latestCompleted}
                      </div>
                    </div>

                    <div className="rounded-xl border border-slate-200 bg-white px-3 py-2.5">
                      <div className="text-[9px] text-slate-500">Blocked</div>
                      <div className="mt-0.5 text-base font-semibold text-slate-950">
                        {latestBlocked}
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="py-10 text-center text-sm text-slate-500">
                  No projects available.
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="border-slate-200/80 bg-white shadow-sm">
            <CardHeader className="border-b border-slate-100 px-5 py-3.5">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-[10px] font-extrabold tracking-[0.16em] text-cyan-600">
                    WORKFLOW HEALTH
                  </div>
                  <h2 className="mt-1 text-lg font-semibold text-slate-900">
                    Task Distribution
                  </h2>
                </div>

                <div className="flex size-9 items-center justify-center rounded-xl bg-sky-50 text-sky-600">
                  <Workflow className="size-[17px]" />
                </div>
              </div>
            </CardHeader>

            <CardContent className="p-4">
              {loading ? (
                <div className="h-44 animate-pulse rounded-xl bg-slate-100" />
              ) : (
                <>
                  <div className="rounded-xl border border-sky-100 bg-sky-50/70 px-4 py-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-2xl font-semibold text-sky-700">
                          {completionRate}%
                        </div>
                        <div className="mt-0.5 text-[10px] text-slate-500">
                          overall completion
                        </div>
                      </div>

                      <CheckCircle2 className="size-7 text-sky-600" />
                    </div>
                  </div>

                  <div className="mt-4 space-y-3.5">
                    {distribution.map((item) => (
                      <div key={item.label}>
                        <div className="mb-1.5 flex items-center justify-between text-[10px]">
                          <span className="text-slate-500">{item.label}</span>
                          <strong className="text-slate-700">
                            {item.value}
                          </strong>
                        </div>

                        <div className="h-1.5 overflow-hidden rounded-full bg-slate-100">
                          <div
                            className={`h-full rounded-full ${item.bar}`}
                            style={{ width: `${item.percent}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </section>

        <Card className="mt-3 border-slate-200/80 bg-white shadow-sm">
          <CardHeader className="flex-row items-center justify-between border-b border-slate-100 px-5 py-3.5">
            <div>
              <div className="text-[10px] font-extrabold tracking-[0.16em] text-cyan-600">
                RECENT ACTIVITY
              </div>
              <h2 className="mt-1 text-lg font-semibold text-slate-900">
                Latest Task Updates
              </h2>
            </div>

            <Button asChild size="sm" variant="outline">
              <Link href="/tasks">Open task board</Link>
            </Button>
          </CardHeader>

          <CardContent className="p-0">
            {loading ? (
              <div className="p-4">
                <div className="h-40 animate-pulse rounded-xl bg-slate-100" />
              </div>
            ) : recentTasks.length === 0 ? (
              <div className="py-8 text-center text-sm text-slate-500">
                No recent task activity.
              </div>
            ) : (
              <div>
                {recentTasks.map((task, index) => {
                  const dotClass =
                    task.status === "DONE"
                      ? "bg-emerald-500 ring-emerald-100"
                      : task.status === "BLOCKED"
                        ? "bg-amber-500 ring-amber-100"
                        : task.status === "IN_PROGRESS"
                          ? "bg-sky-500 ring-sky-100"
                          : "bg-slate-400 ring-slate-100";

                  const badgeClass =
                    task.status === "DONE"
                      ? "bg-emerald-50 text-emerald-700"
                      : task.status === "BLOCKED"
                        ? "bg-amber-50 text-amber-700"
                        : task.status === "IN_PROGRESS"
                          ? "bg-sky-50 text-sky-700"
                          : "bg-slate-100 text-slate-600";

                  return (
                    <article
                      key={task.id}
                      className={`flex items-center gap-4 px-5 py-3.5 ${
                        index !== recentTasks.length - 1
                          ? "border-b border-slate-100"
                          : ""
                      }`}
                    >
                      <span
                        className={`size-2.5 shrink-0 rounded-full ring-4 ${dotClass}`}
                      />

                      <div className="min-w-0 flex-1">
                        <div className="truncate text-sm font-semibold text-slate-900">
                          {task.title}
                        </div>
                        <div className="mt-0.5 text-[10px] text-slate-400">
                          Updated {formatTime(task.updatedAt)}
                        </div>
                      </div>

                      <span
                        className={`shrink-0 rounded-full px-3 py-1 text-[10px] font-semibold ${badgeClass}`}
                      >
                        {formatStatus(task.status)}
                      </span>
                    </article>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
