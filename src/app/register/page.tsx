"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import axios from "axios";
import { ArrowRight, LockKeyhole, Mail, UserRound } from "lucide-react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  type RegisterValues,
  registerSchema,
} from "@/features/auth/register-schema";
import { registerRequest } from "@/lib/api/auth";
import { getDepartments } from "@/lib/api/departments";

export default function RegisterPage() {
  const router = useRouter();

  const departmentsQuery = useQuery({
    queryKey: ["departments"],
    queryFn: getDepartments,
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      departmentId: "",
    },
  });

  const mutation = useMutation({
    mutationFn: registerRequest,
    onSuccess: () => {
      router.push("/dashboard");
    },
  });

  function onSubmit(values: RegisterValues) {
    mutation.mutate(values);
  }

  const errorMessage = (() => {
    if (!mutation.error) return "";

    if (axios.isAxiosError(mutation.error)) {
      return mutation.error.response?.data?.message ?? "Unable to create user.";
    }

    return "Unable to create user.";
  })();

  return (
    <main className="min-h-screen bg-[#07111f] px-5 py-10">
      <div className="mx-auto grid min-h-[calc(100vh-80px)] max-w-6xl items-center gap-10 lg:grid-cols-2">
        <section className="hidden lg:block">
          <div className="max-w-md">
            <div className="flex items-center gap-3">
              <div className="flex size-14 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-400 to-blue-600 text-xl font-black text-white">
                NW
              </div>

              <div>
                <div className="text-xl font-semibold text-white">NodeWave</div>
                <div className="text-sm text-slate-400">Project Operations</div>
              </div>
            </div>

            <h1 className="mt-10 text-5xl font-semibold leading-tight text-white">
              Manage your
              <span className="block text-cyan-400">workspace team.</span>
            </h1>

            <p className="mt-6 text-lg leading-8 text-slate-400">
              Create internal members and keep your project collaboration
              structured.
            </p>
          </div>
        </section>

        <Card className="mx-auto w-full max-w-md rounded-[28px] border-0 shadow-2xl">
          <CardContent className="p-8">
            <div className="mb-8">
              <h2 className="text-3xl font-semibold text-slate-950">
                Team Management
              </h2>

              <p className="mt-2 text-sm text-slate-500">
                Create a new workspace member account.
              </p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              <div>
                <label className="mb-2 block text-sm font-semibold">Name</label>

                <div className="relative">
                  <UserRound className="absolute left-3 top-3.5 size-4 text-slate-400" />

                  <Input className="h-12 pl-10" {...register("name")} />
                </div>

                {errors.name && (
                  <p className="mt-1 text-xs text-red-600">
                    {errors.name.message}
                  </p>
                )}
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold">
                  Email
                </label>

                <div className="relative">
                  <Mail className="absolute left-3 top-3.5 size-4 text-slate-400" />

                  <Input
                    className="h-12 pl-10"
                    type="email"
                    {...register("email")}
                  />
                </div>

                {errors.email && (
                  <p className="mt-1 text-xs text-red-600">
                    {errors.email.message}
                  </p>
                )}
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold">
                  Password
                </label>

                <div className="relative">
                  <LockKeyhole className="absolute left-3 top-3.5 size-4 text-slate-400" />

                  <Input
                    className="h-12 pl-10"
                    type="password"
                    {...register("password")}
                  />
                </div>

                {errors.password && (
                  <p className="mt-1 text-xs text-red-600">
                    {errors.password.message}
                  </p>
                )}
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold">
                  Department
                </label>

                <select
                  className="h-12 w-full rounded-md border px-3 text-sm"
                  {...register("departmentId")}
                >
                  <option value="">Select department</option>

                  {departmentsQuery.data?.map((department) => (
                    <option key={department.id} value={department.id}>
                      {department.name}
                    </option>
                  ))}
                </select>

                {errors.departmentId && (
                  <p className="mt-1 text-xs text-red-600">
                    {errors.departmentId.message}
                  </p>
                )}
              </div>

              {errorMessage && (
                <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  {errorMessage}
                </div>
              )}

              <Button
                type="submit"
                disabled={mutation.isPending}
                className="h-12 w-full bg-gradient-to-r from-cyan-500 to-blue-600 font-semibold text-white shadow-[0_14px_35px_rgba(14,165,233,0.24)] hover:from-cyan-600 hover:to-blue-700"
              >
                {mutation.isPending ? (
                  "Creating..."
                ) : (
                  <>
                    Create User
                    <ArrowRight className="size-4" />
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
