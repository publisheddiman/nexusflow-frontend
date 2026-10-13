"use client";

import {
  Activity,
  Bell,
  CheckCircle2,
  FolderKanban,
  LayoutDashboard,
  ListTodo,
  LogOut,
  Menu,
  UserRound,
  X,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { type ReactNode, useState } from "react";
import { GlobalSearch } from "@/components/layout/global-search";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { logoutRequest } from "@/lib/api/auth";
import { api } from "@/lib/api/client";
import { useAuthStore } from "@/stores/auth-store";
import type { User } from "@/types/api";

function initials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function roleLabel(role: string) {
  if (role === "INTERNAL") return "Internal Team";
  if (role === "CLIENT") return "Client";
  return "PM";
}

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();

  const [mobileOpen, setMobileOpen] = useState(false);
  const [notificationOpen, setNotificationOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [editProfileOpen, setEditProfileOpen] = useState(false);
  const [editingName, setEditingName] = useState("");
  const [profileError, setProfileError] = useState("");
  const [savingProfile, setSavingProfile] = useState(false);
  const [signingOut, setSigningOut] = useState(false);

  const user = useAuthStore((state) => state.user);
  const hydrated = useAuthStore((state) => state.hydrated);
  const logout = useAuthStore((state) => state.logout);

  if (!hydrated || !user) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#f4f7fb] text-sm text-slate-500">
        Loading secure workspace...
      </main>
    );
  }

  const currentUser = user;

  const navigation = [
    { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/projects", label: "Projects", icon: FolderKanban },
    { href: "/tasks", label: "Tasks", icon: ListTodo },
    ...(currentUser.role === "PM"
      ? [
          { href: "/activity", label: "Activity", icon: Activity },
          { href: "/team", label: "Team Management", icon: UserRound },
        ]
      : []),
  ];

  async function handleLogout() {
    if (signingOut) return;

    setSigningOut(true);
    try {
      await logoutRequest();
    } catch {
      // Clear local auth even when server session is already expired.
    } finally {
      logout();
      router.replace("/login");
      setSigningOut(false);
    }
  }

  function openEditProfile() {
    setProfileOpen(false);
    setEditingName(currentUser.name);
    setProfileError("");
    setEditProfileOpen(true);
  }

  async function saveProfile() {
    const name = editingName.trim();

    if (name.length < 2) {
      setProfileError("Name must contain at least 2 characters.");
      return;
    }

    setSavingProfile(true);
    setProfileError("");

    try {
      const response = await api.patch<{
        message: string;
        data: User;
      }>("/auth/profile", { name });

      useAuthStore.setState({ user: response.data.data });
      setEditProfileOpen(false);
    } catch {
      setProfileError("Unable to update profile.");
    } finally {
      setSavingProfile(false);
    }
  }

  function SidebarContent() {
    return (
      <div className="flex h-full flex-col">
        <div className="flex h-[78px] items-center gap-3 border-b border-white/[0.07] px-5">
          <div className="flex size-11 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-400 to-blue-600 text-sm font-black text-white shadow-[0_12px_30px_rgba(14,165,233,0.28)]">
            NW
          </div>
          <div>
            <div className="text-sm font-semibold text-white">NexusFlow</div>
            <div className="text-xs text-slate-500">Workspace</div>
          </div>
        </div>

        <nav className="flex-1 space-y-1.5 px-3 py-5">
          {navigation.map(({ href, label, icon: Icon }) => {
            const active =
              pathname === href ||
              (href !== "/dashboard" && pathname.startsWith(`${href}/`));

            return (
              <Link
                key={href}
                href={href}
                onClick={() => setMobileOpen(false)}
                className={`flex items-center gap-3 rounded-xl px-3.5 py-3 text-sm font-semibold transition ${
                  active
                    ? "bg-cyan-400/10 text-cyan-200 ring-1 ring-inset ring-cyan-400/10"
                    : "text-slate-400 hover:bg-white/[0.045] hover:text-slate-100"
                }`}
              >
                <Icon className="size-[18px]" />
                {label}
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-white/[0.07] p-4">
          <div className="flex items-center gap-3 rounded-2xl bg-white/[0.04] p-3">
            <div className="flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 text-xs font-bold text-white">
              {currentUser.avatarUrl ? (
                <img
                  src={currentUser.avatarUrl}
                  alt={currentUser.name}
                  className="h-full w-full object-cover"
                />
              ) : (
                initials(currentUser.name)
              )}
            </div>

            <div className="min-w-0 flex-1">
              <div className="truncate text-sm font-semibold text-white">
                {currentUser.name}
              </div>
              <div className="truncate text-[11px] text-slate-500">
                {roleLabel(currentUser.role)}
              </div>
            </div>

            <button
              type="button"
              onClick={() => void handleLogout()}
              className="flex size-9 items-center justify-center rounded-xl border border-white/10 text-slate-400 transition hover:bg-white/5 hover:text-white"
              aria-label="Sign out"
            >
              <LogOut className="size-4" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f4f7fb] text-slate-900">
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-[270px] bg-[#07111f] lg:block">
        <SidebarContent />
      </aside>

      {mobileOpen && (
        <div className="fixed inset-0 z-[9000] lg:hidden">
          <button
            type="button"
            aria-label="Close navigation"
            onClick={() => setMobileOpen(false)}
            className="absolute inset-0 bg-slate-950/55 backdrop-blur-sm"
          />
          <aside className="relative h-full w-[285px] bg-[#07111f] shadow-2xl">
            <SidebarContent />
            <button
              type="button"
              aria-label="Close menu"
              onClick={() => setMobileOpen(false)}
              className="absolute right-3 top-3 rounded-xl p-2 text-slate-400 hover:bg-white/10 hover:text-white"
            >
              <X className="size-4" />
            </button>
          </aside>
        </div>
      )}

      <div className="min-w-0 lg:ml-[270px]">
        <header className="sticky top-3 z-[5000] mx-3 mt-3 flex h-[68px] items-center gap-3 rounded-[18px] border border-slate-200/80 bg-white/95 px-4 shadow-sm backdrop-blur-xl sm:px-5 lg:px-6">
          <button
            type="button"
            aria-label="Open navigation"
            onClick={() => setMobileOpen(true)}
            className="rounded-xl border border-slate-200 bg-white p-2 text-slate-600 lg:hidden"
          >
            <Menu className="size-5" />
          </button>

          <div className="min-w-0 flex-1">
            {currentUser.role !== "CLIENT" ? (
              <GlobalSearch />
            ) : (
              <div>
                <div className="text-sm font-semibold text-slate-900">
                  Client Workspace
                </div>
                <div className="text-xs text-slate-500">
                  Delivery visibility
                </div>
              </div>
            )}
          </div>

          <div className="relative z-[6000] ml-auto flex shrink-0 items-center gap-2 pointer-events-auto">
            <button
              type="button"
              aria-label="Notifications"
              aria-expanded={notificationOpen}
              onClick={() => {
                setProfileOpen(false);
                setNotificationOpen((value) => !value);
              }}
              className="flex size-11 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 transition hover:border-slate-300 hover:bg-slate-50 hover:text-slate-800"
            >
              <Bell className="size-[18px]" />
            </button>

            <button
              type="button"
              aria-label="Open profile"
              aria-expanded={profileOpen}
              onClick={() => {
                setNotificationOpen(false);
                setProfileOpen((value) => !value);
              }}
              className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-2.5 py-2 transition hover:border-slate-300 hover:bg-slate-50"
            >
              <div className="flex size-9 items-center justify-center overflow-hidden rounded-xl bg-indigo-50 text-[11px] font-bold text-indigo-700">
                {currentUser.avatarUrl ? (
                  <img
                    src={currentUser.avatarUrl}
                    alt={currentUser.name}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  initials(currentUser.name)
                )}
              </div>

              <div className="hidden min-w-[110px] text-left sm:block">
                <div className="max-w-[145px] truncate text-sm font-semibold text-slate-900">
                  {currentUser.name}
                </div>
                <div className="text-[11px] text-slate-400">
                  {roleLabel(currentUser.role)}
                </div>
              </div>
            </button>
          </div>
        </header>

        <main>{children}</main>
      </div>

      {(notificationOpen || profileOpen) && (
        <button
          type="button"
          aria-label="Close popup"
          className="fixed inset-0 z-[9500] cursor-default bg-transparent"
          onClick={() => {
            setNotificationOpen(false);
            setProfileOpen(false);
          }}
        />
      )}

      {notificationOpen && (
        <section className="fixed right-3 top-[90px] z-[9999] w-[min(330px,calc(100vw-24px))] overflow-hidden rounded-[20px] border border-slate-200 bg-white shadow-[0_24px_70px_rgba(15,23,42,0.22)] sm:right-6">
          <div className="flex items-start justify-between border-b border-slate-100 px-5 py-4">
            <div>
              <div className="text-sm font-semibold text-slate-900">
                Notifications
              </div>
              <div className="mt-0.5 text-xs text-slate-500">
                Workspace updates
              </div>
            </div>
            <button
              type="button"
              aria-label="Close notifications"
              onClick={() => setNotificationOpen(false)}
              className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
            >
              <X className="size-4" />
            </button>
          </div>

          <div className="flex flex-col items-center px-6 py-8 text-center">
            <div className="flex size-11 items-center justify-center rounded-2xl bg-slate-100 text-slate-500">
              <Bell className="size-5" />
            </div>
            <div className="mt-3 text-sm font-semibold text-slate-800">
              No new notifications
            </div>
            <div className="mt-1 max-w-[220px] text-xs leading-5 text-slate-500">
              New workspace notifications will appear here.
            </div>
          </div>
        </section>
      )}

      {profileOpen && (
        <section className="fixed right-3 top-[90px] z-[9999] w-[min(370px,calc(100vw-24px))] overflow-hidden rounded-[20px] border border-slate-200 bg-white shadow-[0_24px_70px_rgba(15,23,42,0.22)] sm:right-6">
          <div className="flex items-center gap-4 border-b border-slate-100 p-5">
            <div className="flex size-12 items-center justify-center overflow-hidden rounded-full bg-indigo-50 text-xs font-bold text-indigo-700">
              {currentUser.avatarUrl ? (
                <img
                  src={currentUser.avatarUrl}
                  alt={currentUser.name}
                  className="h-full w-full object-cover"
                />
              ) : (
                initials(currentUser.name)
              )}
            </div>

            <div className="min-w-0 flex-1">
              <div className="truncate text-sm font-semibold text-slate-900">
                {currentUser.name}
              </div>
              <div className="mt-1 truncate text-xs text-slate-400">
                {currentUser.email}
              </div>
            </div>

            <button
              type="button"
              aria-label="Close profile"
              onClick={() => setProfileOpen(false)}
              className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
            >
              <X className="size-4" />
            </button>
          </div>

          <div className="grid grid-cols-2 gap-2.5 px-5 py-4">
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
              <div className="text-[10px] uppercase tracking-wide text-slate-400">
                Role
              </div>
              <div className="mt-2 text-xs font-semibold text-slate-700">
                {roleLabel(currentUser.role)}
              </div>
            </div>

            <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
              <div className="text-[10px] uppercase tracking-wide text-slate-400">
                Account
              </div>
              <div className="mt-2 flex items-center gap-1.5 text-xs font-semibold text-emerald-700">
                <CheckCircle2 className="size-3.5" />
                Active
              </div>
            </div>
          </div>

          <div className="space-y-2 border-t border-slate-100 p-4">
            <button
              type="button"
              onClick={openEditProfile}
              className="flex w-full items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
            >
              <UserRound className="size-4" />
              Edit profile
            </button>

            <button
              type="button"
              disabled={signingOut}
              onClick={() => void handleLogout()}
              className="flex w-full items-center justify-center gap-2 rounded-xl border border-red-200 bg-white px-4 py-3 text-sm font-medium text-red-600 transition hover:bg-red-50 disabled:opacity-50"
            >
              <LogOut className="size-4" />
              {signingOut ? "Signing out..." : "Sign out"}
            </button>
          </div>
        </section>
      )}

      {editProfileOpen && (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-slate-950/40 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-[22px] border border-slate-200 bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
              <div>
                <div className="text-sm font-semibold text-slate-900">
                  Edit profile
                </div>
                <div className="mt-0.5 text-xs text-slate-500">
                  Update your display name.
                </div>
              </div>

              <button
                type="button"
                onClick={() => setEditProfileOpen(false)}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                aria-label="Close edit profile"
              >
                <X className="size-4" />
              </button>
            </div>

            <div className="space-y-4 p-5">
              <div>
                <label
                  htmlFor="profile-name"
                  className="mb-1.5 block text-xs font-semibold text-slate-600"
                >
                  Name
                </label>
                <Input
                  id="profile-name"
                  value={editingName}
                  onChange={(event) => setEditingName(event.target.value)}
                />
              </div>

              <div>
                <label
                  htmlFor="profile-email"
                  className="mb-1.5 block text-xs font-semibold text-slate-600"
                >
                  Email
                </label>
                <Input id="profile-email" value={currentUser.email} disabled />
              </div>

              {profileError && (
                <div className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-600">
                  {profileError}
                </div>
              )}

              <div className="flex justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setEditProfileOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="button"
                  disabled={savingProfile}
                  onClick={() => void saveProfile()}
                >
                  {savingProfile ? "Saving..." : "Save changes"}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

