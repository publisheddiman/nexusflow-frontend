"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import axios from "axios";
import {
  ArrowRight,
  CheckCircle2,
  Eye,
  EyeOff,
  LockKeyhole,
  Mail,
  ShieldCheck,
  Sparkles,
  Workflow,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { type LoginValues, loginSchema } from "@/features/auth/login-schema";
import { loginRequest } from "@/lib/api/auth";
import { useAuthStore } from "@/stores/auth-store";

export default function LoginPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);

  const user = useAuthStore((state) => state.user);
  const hydrated = useAuthStore((state) => state.hydrated);
  const setSession = useAuthStore((state) => state.setSession);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "pm@nodewave.local",
      password: "Password123!",
    },
  });

  useEffect(() => {
    if (hydrated && user) {
      router.replace("/dashboard");
    }
  }, [hydrated, router, user]);

  const loginMutation = useMutation({
    mutationFn: loginRequest,
    onSuccess: (data) => {
      setSession(data.token, data.user);
      router.replace("/dashboard");
    },
  });

  const apiError = (() => {
    const error = loginMutation.error;

    if (!error) {
      return "";
    }

    if (axios.isAxiosError(error)) {
      const responseData = error.response?.data as
        | { message?: string }
        | undefined;

      return responseData?.message ?? "Unable to sign in.";
    }

    return "Unable to sign in.";
  })();

  function onSubmit(values: LoginValues) {
    loginMutation.mutate(values);
  }

  return (
    <main className="min-h-screen bg-[#07111f] lg:grid lg:grid-cols-[1.06fr_0.94fr]">
      <section className="relative hidden min-h-screen overflow-hidden border-r border-white/10 bg-[radial-gradient(circle_at_20%_18%,rgba(24,185,255,0.18),transparent_32%),linear-gradient(145deg,#07111f_0%,#0b1728_58%,#07111f_100%)] px-12 py-10 text-white lg:flex lg:flex-col lg:justify-between xl:px-16">
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.025)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.025)_1px,transparent_1px)] bg-[size:38px_38px]" />

        <div className="relative z-10">
          <div className="flex items-center gap-3">
            <div className="flex size-11 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-400 to-blue-600 font-black tracking-tight shadow-[0_15px_45px_rgba(24,185,255,0.25)]">
              NW
            </div>
            <div>
              <div className="text-xs font-bold tracking-[0.22em] text-cyan-300">
                NODEWAVE
              </div>
              <div className="text-sm text-slate-400">Project Operations</div>
            </div>
          </div>

          <div className="mt-24 max-w-2xl">
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-400/10 px-3 py-1.5 text-xs font-semibold text-cyan-200">
              <Sparkles className="size-3.5" />
              PROJECT DELIVERY WORKSPACE
            </div>

            <h1 className="max-w-xl text-5xl font-semibold leading-[1.05] tracking-[-0.05em] xl:text-6xl">
              Delivery clarity for every team.
            </h1>

            <p className="mt-6 max-w-xl text-base leading-7 text-slate-400">
              Coordinate project ownership, engineering dependencies, client
              visibility, and immutable delivery history from one operational
              workspace.
            </p>

            <div className="mt-10 grid max-w-xl gap-4">
              {[
                ["Role-based collaboration", ShieldCheck],
                ["Dependency-aware workflow", Workflow],
                ["Immutable audit history", CheckCircle2],
              ].map(([label, Icon]) => (
                <div
                  key={label as string}
                  className="flex items-center gap-3 text-sm text-slate-300"
                >
                  <div className="flex size-9 items-center justify-center rounded-xl border border-cyan-400/15 bg-cyan-400/10 text-cyan-300">
                    <Icon className="size-4" />
                  </div>
                  <span>{label as string}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="relative z-10 rounded-3xl border border-white/10 bg-white/[0.045] p-6 backdrop-blur">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-[11px] font-bold tracking-[0.2em] text-cyan-300">
                OPERATIONS CONTROL
              </div>
              <div className="mt-1 font-semibold">Delivery workspace</div>
            </div>
            <div className="flex items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1.5 text-xs font-medium text-emerald-300">
              <ShieldCheck className="size-3.5" />
              Secure
            </div>
          </div>

          <div className="mt-6 grid grid-cols-4 gap-2 text-center text-xs text-slate-400">
            {["Plan", "Build", "Review", "Deliver"].map((step, index) => (
              <div key={step}>
                <div className="mb-2 h-1.5 rounded-full bg-gradient-to-r from-cyan-400 to-blue-600 opacity-80" />
                <span>
                  {index + 1}. {step}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="relative flex min-h-screen items-center justify-center overflow-hidden bg-slate-50 px-5 py-10 sm:px-8 lg:px-12">
        <div className="pointer-events-none absolute left-[-80px] top-[-80px] size-72 rounded-full bg-cyan-300/20 blur-3xl" />
        <div className="pointer-events-none absolute bottom-[-100px] right-[-80px] size-80 rounded-full bg-blue-300/20 blur-3xl" />

        <div className="relative z-10 w-full max-w-[520px]">
          <div className="mb-7">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-cyan-200 bg-cyan-50 px-3 py-1.5 text-xs font-bold tracking-wide text-cyan-700">
              <ShieldCheck className="size-3.5" />
              SECURE WORKSPACE ACCESS
            </div>

            <h2 className="text-4xl font-semibold tracking-[-0.04em] text-slate-950">
              Sign in to your <span className="text-cyan-600">workspace</span>
            </h2>

            <p className="mt-3 text-sm leading-6 text-slate-500">
              Use your NodeWave account to access your assigned projects and
              delivery workflow.
            </p>
          </div>

          <div className="mb-4 grid grid-cols-2 gap-3 text-xs font-medium text-slate-600">
            <div className="flex items-center gap-2 rounded-xl border bg-white px-3 py-2.5 shadow-sm">
              <LockKeyhole className="size-4 text-cyan-600" />
              Secure access
            </div>
            <div className="flex items-center gap-2 rounded-xl border bg-white px-3 py-2.5 shadow-sm">
              <Workflow className="size-4 text-cyan-600" />
              Role aware
            </div>
          </div>

          <Card className="border-slate-200/80 bg-white/90 shadow-[0_28px_80px_rgba(15,23,42,0.10)] backdrop-blur">
            <CardContent className="p-6 sm:p-8">
              <form className="space-y-5" onSubmit={handleSubmit(onSubmit)}>
                <div>
                  <label
                    htmlFor="email"
                    className="mb-2 block text-sm font-semibold text-slate-800"
                  >
                    Email address
                  </label>
                  <div className="relative">
                    <Mail className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
                    <Input
                      id="email"
                      type="email"
                      autoComplete="email"
                      className="h-12 pl-10"
                      {...register("email")}
                    />
                  </div>
                  {errors.email && (
                    <p className="mt-1.5 text-xs font-medium text-red-600">
                      {errors.email.message}
                    </p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="password"
                    className="mb-2 block text-sm font-semibold text-slate-800"
                  >
                    Password
                  </label>
                  <div className="relative">
                    <LockKeyhole className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      autoComplete="current-password"
                      className="h-12 px-10"
                      {...register("password")}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((value) => !value)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 transition hover:text-slate-700"
                      aria-label={
                        showPassword ? "Hide password" : "Show password"
                      }
                    >
                      {showPassword ? (
                        <EyeOff className="size-4" />
                      ) : (
                        <Eye className="size-4" />
                      )}
                    </button>
                  </div>
                  {errors.password && (
                    <p className="mt-1.5 text-xs font-medium text-red-600">
                      {errors.password.message}
                    </p>
                  )}
                </div>

                {apiError && (
                  <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
                    {apiError}
                  </div>
                )}

                <Button
                  type="submit"
                  disabled={loginMutation.isPending}
                  className="h-12 w-full bg-gradient-to-r from-cyan-500 to-blue-600 font-semibold text-white shadow-[0_14px_35px_rgba(14,165,233,0.24)] hover:from-cyan-600 hover:to-blue-700"
                >
                  {loginMutation.isPending ? (
                    "Signing in..."
                  ) : (
                    <>
                      Sign in
                      <ArrowRight className="size-4" />
                    </>
                  )}
                </Button>
              </form>

              <div className="mt-6 border-t pt-5 text-center text-xs text-slate-500">
                <div className="flex items-center justify-center gap-2">
                  <ShieldCheck className="size-3.5" />
                  Protected workspace authentication
                </div>
              </div>
            </CardContent>
          </Card>

          <p className="mt-6 text-center text-xs text-slate-400">
            NodeWave Project Operations · Secure Workspace
          </p>
        </div>
      </section>
    </main>
  );
}
