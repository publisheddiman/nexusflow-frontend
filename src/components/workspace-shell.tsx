"use client";

import {
  Activity,
  Bell,
  FolderKanban,
  LayoutDashboard,
  ListTodo,
  LogOut,
  Menu,
  Search,
  X,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { type ReactNode, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { logoutRequest } from "@/lib/api/logout";
import { useAuthStore } from "@/stores/auth-store";

type WorkspaceShellProps = {
  children: ReactNode;
};

function initials(name?: string) {
  if (!name) return "NW";

  return name
    .split(" ")
    .filter(Boolean)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export function WorkspaceShell({ children }: WorkspaceShellProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  const user = useAuthStore((state) => state.user);
  const hydrated = useAuthStore((state) => state.hydrated);
  const logout = useAuthStore((state) => state.logout);

  useEffect(() => {
    if (hydrated && !user) {
      router.replace("/login");
    }
  }, [hydrated, router, user]);

  if (!hydrated || !user) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50 text-sm text-slate-500">
        Loading workspace...
      </main>
    );
  }

  const navItems = [
    { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/projects", label: "Projects", icon: FolderKanban },
    { href: "/tasks", label: "Tasks", icon: ListTodo },
    ...(user.role === "PM"
      ? [{ href: "/activity", label: "Activity", icon: Activity }]
      : []),
  ];

  async function handleLogout() {
    if (loggingOut) return;

    setLoggingOut(true);

    try {
      await logoutRequest();
    } catch {
      // Local session is cleared even if the server session expired.
    } finally {
      logout();
      router.replace("/login");
      setLoggingOut(false);
    }
  }

  const sidebar = (
    <aside className="flex h-full flex-col bg-[#07111f] text-white">
      <div className="flex h-20 items-center gap-3 border-b border-white/10 px-6">
        <div className="flex size-10 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-400 to-blue-600 text-sm font-black shadow-[0_12px_35px_rgba(14,165,233,0.28)]">
          NW
        </div>
        <div>
          <div className="text-xs font-bold tracking-[0.2em] text-cyan-300">
            NexusFlow
          </div>
          <div className="text-xs text-slate-400">Project Operations</div>
        </div>
      </div>

      <nav className="flex-1 space-y-1 px-3 py-6">
        {navItems.map(({ href, label, icon: Icon }) => {
          const active =
            pathname === href ||
            (href !== "/dashboard" && pathname.startsWith(`${href}/`));

          return (
            <Link
              key={href}
              href={href}
              onClick={() => setMobileOpen(false)}
              className={`flex items-center gap-3 rounded-xl px-3.5 py-3 text-sm font-medium transition ${
                active
                  ? "bg-cyan-400/12 text-cyan-200"
                  : "text-slate-400 hover:bg-white/5 hover:text-white"
              }`}
            >
              <Icon className="size-[18px]" />
              {label}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-white/10 p-4">
        <div className="mb-3 flex items-center gap-3 rounded-2xl bg-white/[0.045] p-3">
          <div className="flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-gradient-to-br from-cyan-400 to-blue-600 text-xs font-bold">
            {user.avatarUrl ? (
              <img
                src={user.avatarUrl}
                alt={user.name}
                className="h-full w-full object-cover"
              />
            ) : (
              initials(user.name)
            )}
          </div>

          <div className="min-w-0 flex-1">
            <div className="truncate text-sm font-semibold">{user.name}</div>
            <div className="truncate text-xs text-slate-400">{user.role}</div>
          </div>
        </div>

        <Button
          variant="ghost"
          disabled={loggingOut}
          onClick={handleLogout}
          className="w-full justify-start text-slate-400 hover:bg-white/5 hover:text-white"
        >
          <LogOut className="size-4" />
          {loggingOut ? "Signing out..." : "Sign out"}
        </Button>
      </div>
    </aside>
  );

  return (
    <div className="min-h-screen bg-[#f5f7fb]">
      <div className="fixed inset-y-0 left-0 z-40 hidden w-[270px] lg:block">
        {sidebar}
      </div>

      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            className="absolute inset-0 bg-slate-950/50 backdrop-blur-sm"
            onClick={() => setMobileOpen(false)}
            aria-label="Close navigation"
          />
          <div className="relative h-full w-[280px] shadow-2xl">
            {sidebar}
            <button
              type="button"
              className="absolute right-3 top-3 rounded-lg p-2 text-slate-400 hover:bg-white/10 hover:text-white"
              onClick={() => setMobileOpen(false)}
              aria-label="Close menu"
            >
              <X className="size-5" />
            </button>
          </div>
        </div>
      )}

      <div className="lg:ml-[270px]">
        <header className="sticky top-0 z-30 flex h-20 items-center gap-4 border-b border-slate-200/80 bg-white/90 px-5 backdrop-blur-xl sm:px-8">
          <button
            type="button"
            className="rounded-xl border border-slate-200 p-2 text-slate-600 lg:hidden"
            onClick={() => setMobileOpen(true)}
            aria-label="Open menu"
          >
            <Menu className="size-5" />
          </button>

          <div className="relative hidden max-w-xl flex-1 md:block">
            <Search className="absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
            <input
              type="search"
              placeholder="Search projects and tasks..."
              className="h-10 w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-4 text-sm outline-none transition focus:border-cyan-400 focus:bg-white focus:ring-4 focus:ring-cyan-100"
            />
          </div>

          <div className="ml-auto flex items-center gap-3">
            <button
              type="button"
              className="relative flex size-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 transition hover:bg-slate-50 hover:text-slate-800"
              aria-label="Notifications"
            >
              <Bell className="size-[18px]" />
            </button>

            <div className="hidden items-center gap-3 sm:flex">
              <div className="flex size-10 items-center justify-center overflow-hidden rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 text-xs font-bold text-white">
                {user.avatarUrl ? (
                  <img
                    src={user.avatarUrl}
                    alt={user.name}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  initials(user.name)
                )}
              </div>
              <div className="max-w-[150px]">
                <div className="truncate text-sm font-semibold text-slate-800">
                  {user.name}
                </div>
                <div className="truncate text-xs text-slate-500">
                  {user.role}
                </div>
              </div>
            </div>
          </div>
        </header>

        <div>{children}</div>
      </div>
    </div>
  );
}

