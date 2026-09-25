"use client";

import { useQuery } from "@tanstack/react-query";
import {
  Activity,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Clock3,
  History,
  Search,
  ShieldCheck,
  UserRound,
  X,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { type FormEvent, useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { type AuditRecord, getAuditLogs } from "@/lib/api/audit";
import { useAuthStore } from "@/stores/auth-store";

const PAGE_SIZE = 20;

const FIELD_OPTIONS = [
  "",
  "status",
  "title",
  "description",
  "department",
  "assigneeId",
  "isClientVisible",
  "projectId",
  "createdById",
  "version",
  "deletedAt",
] as const;

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
    timeStyle: "medium",
  }).format(new Date(value));
}

function displayValue(value: string | null) {
  if (value === null || value === "") {
    return "Ã¢â‚¬â€";
  }

  return value;
}

function fieldLabel(value: string) {
  const labels: Record<string, string> = {
    status: "Status",
    title: "Title",
    description: "Description",
    department: "Department",
    assigneeId: "Assignee",
    isClientVisible: "Client Visibility",
    projectId: "Project",
    createdById: "Created By",
    version: "Version",
    deletedAt: "Deleted At",
  };

  return labels[value] ?? value;
}

function changeTone(column: string) {
  if (column === "status") {
    return "bg-blue-50 text-blue-700 ring-blue-100";
  }

  if (column === "deletedAt") {
    return "bg-red-50 text-red-700 ring-red-100";
  }

  if (column === "assigneeId") {
    return "bg-violet-50 text-violet-700 ring-violet-100";
  }

  return "bg-slate-100 text-slate-600 ring-slate-200";
}

export default function ActivityPage() {
  const user = useAuthStore((state) => state.user);
  const router = useRouter();

  const [page, setPage] = useState(1);
  const [searchInput, setSearchInput] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [field, setField] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  useEffect(() => {
    if (user && user.role !== "PM") {
      router.replace("/dashboard");
    }
  }, [router, user]);

  const query = useQuery({
    queryKey: [
      "audit",
      "activity",
      page,
      searchTerm,
      field,
      startDate,
      endDate,
    ],
    enabled: user?.role === "PM",
    queryFn: () =>
      getAuditLogs({
        page,
        rows: PAGE_SIZE,
        orderKey: "createdAt",
        orderRule: "desc",
        ...(field
          ? {
              filters: {
                changedColumn: field,
              },
            }
          : {}),
        ...(searchTerm
          ? {
              searchFilters: {
                changedColumn: searchTerm,
                oldValue: searchTerm,
                newValue: searchTerm,
              },
            }
          : {}),
        ...(startDate || endDate
          ? {
              rangedFilters: [
                {
                  key: "createdAt",
                  start: startDate
                    ? new Date(`${startDate}T00:00:00`).toISOString()
                    : "1970-01-01T00:00:00.000Z",
                  end: endDate
                    ? new Date(`${endDate}T23:59:59.999`).toISOString()
                    : "9999-12-31T23:59:59.999Z",
                },
              ],
            }
          : {}),
      }),
  });

  const logs = query.data?.data ?? [];
  const pagination = query.data?.pagination;

  const totalData = pagination?.totalData ?? logs.length;
  const totalPages = Math.max(pagination?.totalPage ?? 1, 1);

  const uniqueUsers = useMemo(
    () => new Set(logs.map((entry) => entry.userId)).size,
    [logs],
  );

  const uniqueTasks = useMemo(
    () => new Set(logs.map((entry) => entry.taskId)).size,
    [logs],
  );

  if (!user) {
    return null;
  }

  if (user.role !== "PM") {
    return null;
  }

  function submitSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPage(1);
    setSearchTerm(searchInput.trim());
  }

  function clearFilters() {
    setPage(1);
    setSearchInput("");
    setSearchTerm("");
    setField("");
    setStartDate("");
    setEndDate("");
  }

  const hasFilters =
    Boolean(searchTerm) ||
    Boolean(field) ||
    Boolean(startDate) ||
    Boolean(endDate);

  return (
    <div className="px-5 py-7 sm:px-7 lg:px-9 lg:py-8">
      <div className="mx-auto max-w-[1500px]">
        <section className="rounded-[22px] border border-slate-200/80 bg-white px-5 py-5 shadow-sm sm:px-6">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <div className="text-[10px] font-extrabold tracking-[0.17em] text-cyan-600">
                IMMUTABLE AUDIT TRAIL
              </div>

              <h1 className="mt-2 text-3xl font-semibold tracking-[-0.04em] text-slate-950">
                Activity
              </h1>

              <p className="mt-1.5 max-w-2xl text-sm leading-6 text-slate-500">
                PM-only operational history for task field changes, including
                actor, timestamp, changed column, and before/after values.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <span className="flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700">
                <ShieldCheck className="size-3.5" />
                PM Only
              </span>

              <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-medium text-slate-600">
                {query.isPending ? "Loading..." : `${totalData} audit entries`}
              </span>
            </div>
          </div>

          <div className="mt-5 grid gap-2 sm:grid-cols-3">
            <div className="rounded-xl bg-cyan-50/70 px-3 py-2.5">
              <div className="text-[10px] font-bold uppercase tracking-[0.12em] text-cyan-600">
                Visible Entries
              </div>
              <div className="mt-1 text-lg font-semibold text-cyan-900">
                {query.isPending ? "Ã¢â‚¬â€" : logs.length}
              </div>
            </div>

            <div className="rounded-xl bg-blue-50/70 px-3 py-2.5">
              <div className="text-[10px] font-bold uppercase tracking-[0.12em] text-blue-600">
                Actors on Page
              </div>
              <div className="mt-1 text-lg font-semibold text-blue-900">
                {query.isPending ? "Ã¢â‚¬â€" : uniqueUsers}
              </div>
            </div>

            <div className="rounded-xl bg-violet-50/70 px-3 py-2.5">
              <div className="text-[10px] font-bold uppercase tracking-[0.12em] text-violet-600">
                Tasks on Page
              </div>
              <div className="mt-1 text-lg font-semibold text-violet-900">
                {query.isPending ? "Ã¢â‚¬â€" : uniqueTasks}
              </div>
            </div>
          </div>
        </section>

        <section className="mt-3 rounded-[18px] border border-slate-200/80 bg-white p-3 shadow-sm">
          <form
            onSubmit={submitSearch}
            className="grid gap-2 xl:grid-cols-[minmax(0,1fr)_190px_160px_160px_auto]"
          >
            <div className="relative min-w-0">
              <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
              <input
                value={searchInput}
                onChange={(event) => setSearchInput(event.target.value)}
                placeholder="Search changed field or old/new value..."
                className="h-10 w-full rounded-xl border border-slate-200 bg-slate-50 pl-9 pr-3 text-xs text-slate-700 outline-none transition focus:border-cyan-400 focus:bg-white focus:ring-4 focus:ring-cyan-500/10"
              />
            </div>

            <select
              value={field}
              onChange={(event) => {
                setField(event.target.value);
                setPage(1);
              }}
              className="h-10 rounded-xl border border-slate-200 bg-slate-50 px-3 text-xs font-medium text-slate-700 outline-none focus:border-cyan-400"
            >
              <option value="">All fields</option>
              {FIELD_OPTIONS.filter(Boolean).map((value) => (
                <option key={value} value={value}>
                  {fieldLabel(value)}
                </option>
              ))}
            </select>

            <input
              type="date"
              value={startDate}
              onChange={(event) => {
                setStartDate(event.target.value);
                setPage(1);
              }}
              className="h-10 rounded-xl border border-slate-200 bg-slate-50 px-3 text-xs text-slate-700 outline-none focus:border-cyan-400"
              aria-label="Start date"
            />

            <input
              type="date"
              value={endDate}
              onChange={(event) => {
                setEndDate(event.target.value);
                setPage(1);
              }}
              className="h-10 rounded-xl border border-slate-200 bg-slate-50 px-3 text-xs text-slate-700 outline-none focus:border-cyan-400"
              aria-label="End date"
            />

            <div className="flex gap-2">
              <Button type="submit" size="sm" className="h-10">
                Search
              </Button>

              {hasFilters && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="h-10"
                  onClick={clearFilters}
                >
                  <X className="size-3.5" />
                  Clear
                </Button>
              )}
            </div>
          </form>
        </section>

        {query.isError ? (
          <section className="mt-3 rounded-[18px] border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            Unable to load audit activity. Check the backend connection or query
            filters.
          </section>
        ) : query.isPending ? (
          <section className="mt-3 space-y-2">
            {[1, 2, 3, 4, 5, 6].map((item) => (
              <div
                key={item}
                className="h-[112px] animate-pulse rounded-[18px] border border-slate-200 bg-white"
              />
            ))}
          </section>
        ) : logs.length === 0 ? (
          <section className="mt-3 rounded-[22px] border border-dashed border-slate-300 bg-white px-6 py-16 text-center shadow-sm">
            <div className="mx-auto flex size-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-500">
              <History className="size-5" />
            </div>
            <h2 className="mt-4 text-base font-semibold text-slate-900">
              No audit entries found
            </h2>
            <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-slate-500">
              Try clearing the current filters or make a task change to generate
              a new immutable audit entry.
            </p>
          </section>
        ) : (
          <section className="mt-3 space-y-2">
            {logs.map((entry: AuditRecord) => (
              <article
                key={entry.id}
                className="rounded-[18px] border border-slate-200/80 bg-white p-4 shadow-sm transition hover:border-slate-300 hover:shadow-md"
              >
                <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        className={`rounded-full px-2.5 py-1 text-[10px] font-bold ring-1 ring-inset ${changeTone(
                          entry.changedColumn,
                        )}`}
                      >
                        {fieldLabel(entry.changedColumn)}
                      </span>

                      <span className="flex items-center gap-1 text-[10px] text-slate-400">
                        <Clock3 className="size-3" />
                        {formatDate(entry.createdAt)}
                      </span>
                    </div>

                    <div className="mt-3 flex flex-col gap-2 md:flex-row md:items-center">
                      <div className="min-w-0">
                        <div className="truncate text-sm font-semibold text-slate-900">
                          {entry.task.title}
                        </div>
                        <div className="mt-1 text-[11px] text-slate-400">
                          {entry.task.project.name}
                        </div>
                      </div>

                      <div className="hidden h-7 w-px bg-slate-200 md:block" />

                      <div className="flex min-w-0 items-center gap-2">
                        <div className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-500">
                          <UserRound className="size-3.5" />
                        </div>
                        <div className="min-w-0">
                          <div className="truncate text-xs font-semibold text-slate-700">
                            {entry.user.name}
                          </div>
                          <div className="truncate text-[10px] text-slate-400">
                            {entry.user.email}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="grid min-w-0 gap-2 sm:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] xl:w-[620px]">
                    <div className="min-w-0 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5">
                      <div className="text-[9px] font-bold uppercase tracking-[0.12em] text-slate-400">
                        Old Value
                      </div>
                      <div className="mt-1 break-words text-xs font-medium text-slate-600">
                        {displayValue(entry.oldValue)}
                      </div>
                    </div>

                    <div className="flex items-center justify-center text-slate-300">
                      <ArrowRight className="size-4 rotate-90 sm:rotate-0" />
                    </div>

                    <div className="min-w-0 rounded-xl border border-cyan-100 bg-cyan-50/50 px-3 py-2.5">
                      <div className="text-[9px] font-bold uppercase tracking-[0.12em] text-cyan-500">
                        New Value
                      </div>
                      <div className="mt-1 break-words text-xs font-semibold text-cyan-800">
                        {displayValue(entry.newValue)}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-3 flex justify-end border-t border-slate-100 pt-3">
                  <Button asChild variant="ghost" size="sm">
                    <Link href={`/tasks?task=${entry.task.id}`}>
                      <Activity className="size-3.5" />
                      Open task
                    </Link>
                  </Button>
                </div>
              </article>
            ))}
          </section>
        )}

        {!query.isPending && !query.isError && totalData > 0 && (
          <footer className="mt-4 flex flex-col gap-3 rounded-[18px] border border-slate-200 bg-white px-4 py-3 shadow-sm sm:flex-row sm:items-center sm:justify-between">
            <div className="text-xs text-slate-500">
              Page{" "}
              <span className="font-semibold text-slate-700">
                {pagination?.page ?? page}
              </span>{" "}
              of{" "}
              <span className="font-semibold text-slate-700">{totalPages}</span>
              <span className="ml-2 text-slate-400">{totalData} entries</span>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={page <= 1}
                onClick={() => setPage((current) => Math.max(1, current - 1))}
              >
                <ChevronLeft className="size-4" />
                Previous
              </Button>

              <Button
                variant="outline"
                size="sm"
                disabled={page >= totalPages}
                onClick={() => setPage((current) => current + 1)}
              >
                Next
                <ChevronRight className="size-4" />
              </Button>
            </div>
          </footer>
        )}
      </div>
    </div>
  );
}
