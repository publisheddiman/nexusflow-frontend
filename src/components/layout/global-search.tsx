"use client";

import { useQuery } from "@tanstack/react-query";
import { FolderKanban, ListTodo, Search, X } from "lucide-react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { getProjects } from "@/lib/api/projects";
import { getTasks } from "@/lib/api/tasks";

export function GlobalSearch() {
  const [value, setValue] = useState("");
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  const term = value.trim();

  const searchQuery = useQuery({
    queryKey: ["global-search", term],
    enabled: term.length >= 2,
    queryFn: async () => {
      const [projects, tasks] = await Promise.all([
        getProjects({
          page: 1,
          rows: 5,
          searchFilters: {
            name: term,
            description: term,
          },
        }),
        getTasks({
          page: 1,
          rows: 5,
          searchFilters: {
            title: term,
            description: term,
          },
        }),
      ]);

      return {
        projects: projects.data,
        tasks: tasks.data,
      };
    },
  });

  useEffect(() => {
    function closeOutside(event: MouseEvent) {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", closeOutside);
    return () => document.removeEventListener("mousedown", closeOutside);
  }, []);

  const projects = searchQuery.data?.projects ?? [];
  const tasks = searchQuery.data?.tasks ?? [];
  const hasResults = projects.length > 0 || tasks.length > 0;

  return (
    <div ref={wrapperRef} className="relative w-full max-w-[640px]">
      <div className="relative">
        <Search className="absolute left-4 top-1/2 size-[17px] -translate-y-1/2 text-slate-400" />

        <input
          value={value}
          onFocus={() => setOpen(true)}
          onChange={(event) => {
            setValue(event.target.value);
            setOpen(true);
          }}
          placeholder="Search projects and tasks..."
          className="h-11 w-full rounded-2xl border border-slate-200 bg-slate-50 pl-11 pr-10 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-cyan-400 focus:bg-white focus:ring-4 focus:ring-cyan-500/10"
        />

        {value && (
          <button
            type="button"
            aria-label="Clear search"
            onClick={() => {
              setValue("");
              setOpen(false);
            }}
            className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
          >
            <X className="size-4" />
          </button>
        )}
      </div>

      {open && term.length >= 2 && (
        <div className="absolute left-0 right-0 top-[52px] z-50 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_20px_60px_rgba(15,23,42,0.14)]">
          {searchQuery.isPending ? (
            <div className="px-5 py-6 text-sm text-slate-500">
              Searching workspace...
            </div>
          ) : searchQuery.isError ? (
            <div className="px-5 py-6 text-sm text-red-600">
              Unable to search workspace.
            </div>
          ) : !hasResults ? (
            <div className="px-5 py-6 text-sm text-slate-500">
              No matching projects or tasks.
            </div>
          ) : (
            <div className="max-h-[420px] overflow-y-auto p-2">
              {projects.length > 0 && (
                <div>
                  <div className="px-3 pb-2 pt-2 text-[10px] font-bold tracking-[0.16em] text-slate-400">
                    PROJECTS
                  </div>

                  {projects.map((project) => (
                    <Link
                      key={project.id}
                      href={`/projects/${project.id}`}
                      onClick={() => setOpen(false)}
                      className="flex items-center gap-3 rounded-xl px-3 py-3 transition hover:bg-slate-50"
                    >
                      <div className="flex size-9 items-center justify-center rounded-xl bg-cyan-50 text-cyan-600">
                        <FolderKanban className="size-4" />
                      </div>
                      <div className="min-w-0">
                        <div className="truncate text-sm font-semibold text-slate-800">
                          {project.name}
                        </div>
                        <div className="text-xs text-slate-400">Project</div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}

              {tasks.length > 0 && (
                <div className={projects.length ? "mt-2 border-t pt-2" : ""}>
                  <div className="px-3 pb-2 pt-2 text-[10px] font-bold tracking-[0.16em] text-slate-400">
                    TASKS
                  </div>

                  {tasks.map((task) => (
                    <Link
                      key={task.id}
                      href={`/tasks?task=${task.id}`}
                      onClick={() => setOpen(false)}
                      className="flex items-center gap-3 rounded-xl px-3 py-3 transition hover:bg-slate-50"
                    >
                      <div className="flex size-9 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                        <ListTodo className="size-4" />
                      </div>
                      <div className="min-w-0">
                        <div className="truncate text-sm font-semibold text-slate-800">
                          {task.title}
                        </div>
                        <div className="text-xs text-slate-400">
                          {task.status.replaceAll("_", " ")}
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

