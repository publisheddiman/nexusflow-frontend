"use client";

import { useQuery } from "@tanstack/react-query";
import { Layers3, UserRoundCheck, Users } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import { getUsers } from "@/lib/api/users";

function roleLabel(role: string) {
  if (role === "INTERNAL") return "Internal Team";
  if (role === "CLIENT") return "Client Guest";
  return "Product Manager";
}

export default function TeamPage() {
  const usersQuery = useQuery({
    queryKey: ["users"],
    queryFn: getUsers,
  });

  const users = usersQuery.data ?? [];

  const internalCount = users.filter((user) => user.role === "INTERNAL").length;

  const departmentCount = new Set(
    users.map((user) => user.department?.name).filter(Boolean),
  ).size;

  if (usersQuery.isPending) {
    return <div className="p-8 text-slate-500">Loading team members...</div>;
  }

  if (usersQuery.isError) {
    return <div className="p-8 text-red-600">Failed to load team members.</div>;
  }

  return (
    <main className="space-y-8 p-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold text-slate-950">
            Team Management
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            Manage workspace members and department access.
          </p>
        </div>

        <Link href="/register">
          <Button className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white">
            + Add Member
          </Button>
        </Link>
      </div>

      <section className="grid gap-4 md:grid-cols-3">
        <Card className="border-slate-200/80 bg-white shadow-sm">
          <CardContent className="flex items-center gap-4 p-5">
            <div className="rounded-xl bg-cyan-50 p-3">
              <Users className="size-5 text-cyan-600" />
            </div>

            <div>
              <p className="text-sm text-slate-500">Total Members</p>

              <p className="text-2xl font-semibold">{users.length}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200/80 bg-white shadow-sm">
          <CardContent className="flex items-center gap-4 p-5">
            <div className="rounded-xl bg-blue-50 p-3">
              <UserRoundCheck className="size-5 text-blue-600" />
            </div>

            <div>
              <p className="text-sm text-slate-500">Internal Team</p>

              <p className="text-2xl font-semibold">{internalCount}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200/80 bg-white shadow-sm">
          <CardContent className="flex items-center gap-4 p-5">
            <div className="rounded-xl bg-indigo-50 p-3">
              <Layers3 className="size-5 text-indigo-600" />
            </div>

            <div>
              <p className="text-sm text-slate-500">Departments</p>

              <p className="text-2xl font-semibold">{departmentCount}</p>
            </div>
          </CardContent>
        </Card>
      </section>

      <Card className="border-slate-200/80 bg-white shadow-sm">
        <CardHeader>
          <CardTitle>Member Directory</CardTitle>
        </CardHeader>

        <CardContent className="space-y-3">
          {users.map((user) => (
            <div
              key={user.id}
              className="flex items-center justify-between rounded-xl border border-slate-100 p-4"
            >
              <div>
                <p className="font-semibold text-slate-900">{user.name}</p>

                <p className="text-sm text-slate-500">{user.email}</p>
              </div>

              <div className="text-right">
                <p className="text-sm font-medium">{roleLabel(user.role)}</p>

                <p className="text-xs text-slate-500">
                  {user.department?.name ?? "-"}
                </p>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </main>
  );
}

