"use client";

import { ArrowRight, Loader2 } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { type FormEvent, useState, useTransition } from "react";
import {
  requestPasswordReset,
  signInWithDemoAccount,
  signInWithGoogle,
  signInWithPassword,
  signUpWithPassword,
  updatePassword,
} from "@/lib/auth-actions";
import { cn } from "@/lib/utils";

type AuthMode = "login" | "signup" | "forgot" | "reset";

type AuthCardProps = {
  mode: AuthMode;
};

const inputClass =
  "h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 outline-none transition focus:border-blue-300 focus:ring-4 focus:ring-blue-100";

const copy = {
  forgot: {
    cta: "Send reset link",
    subtitle: "Enter your email and we will send a password reset link.",
    title: "Reset your password",
  },
  login: {
    cta: "Sign in",
    subtitle: "Access your client workspace, projects, files, and invoices.",
    title: "Welcome back",
  },
  reset: {
    cta: "Update password",
    subtitle: "Choose a new password for your ClientFlow account.",
    title: "Create a new password",
  },
  signup: {
    cta: "Create account",
    subtitle: "Start a workspace for your clients, projects, and team.",
    title: "Create your workspace",
  },
} satisfies Record<AuthMode, { cta: string; subtitle: string; title: string }>;

function GoogleIcon() {
  return (
    <svg aria-hidden="true" className="size-5 shrink-0" viewBox="0 0 24 24">
      <path
        d="M21.6 12.23c0-.78-.07-1.53-.2-2.23H12v4.22h5.38a4.6 4.6 0 0 1-1.99 3.02v2.51h3.23c1.89-1.74 2.98-4.31 2.98-7.52z"
        fill="#4285F4"
      />
      <path
        d="M12 22c2.7 0 4.96-.9 6.62-2.42l-3.23-2.51c-.9.6-2.04.95-3.39.95-2.6 0-4.8-1.76-5.59-4.12H3.08v2.59A10 10 0 0 0 12 22z"
        fill="#34A853"
      />
      <path
        d="M6.41 13.9a6.01 6.01 0 0 1 0-3.8V7.51H3.08a10 10 0 0 0 0 8.98l3.33-2.59z"
        fill="#FBBC05"
      />
      <path
        d="M12 5.98c1.47 0 2.79.51 3.82 1.5l2.87-2.87A9.61 9.61 0 0 0 12 2a10 10 0 0 0-8.92 5.51l3.33 2.59C7.2 7.74 9.4 5.98 12 5.98z"
        fill="#EA4335"
      />
    </svg>
  );
}

export function AuthCard({ mode }: AuthCardProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const [isDemoPending, startDemoTransition] = useTransition();
  const [feedback, setFeedback] = useState<{
    tone: "error" | "success";
    message: string;
  } | null>(
    searchParams.get("error")
      ? { message: String(searchParams.get("error")), tone: "error" }
      : null,
  );

  const details = copy[mode];
  const isAuthBusy = isPending || isDemoPending;

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const payload = Object.fromEntries(formData);

    startTransition(async () => {
      const result =
        mode === "login"
          ? await signInWithPassword(payload)
          : mode === "signup"
            ? await signUpWithPassword(payload)
            : mode === "forgot"
              ? await requestPasswordReset(payload)
              : await updatePassword(payload);

      if (!result.ok) {
        setFeedback({
          message: result.error ?? "Something went wrong.",
          tone: "error",
        });
        return;
      }

      setFeedback({
        message: result.message ?? "Success.",
        tone: "success",
      });

      if (result.redirectTo) {
        router.push(result.redirectTo);
        router.refresh();
      }
    });
  };

  const handleDemoLogin = () => {
    setFeedback(null);

    startDemoTransition(async () => {
      const result = await signInWithDemoAccount();

      if (!result.ok) {
        setFeedback({
          message: result.error ?? "Unable to open the demo workspace.",
          tone: "error",
        });
        return;
      }

      setFeedback({
        message: result.message ?? "Opening demo workspace.",
        tone: "success",
      });

      if (result.redirectTo) {
        router.push(result.redirectTo);
        router.refresh();
      }
    });
  };

  return (
    <main className="min-h-screen bg-[var(--app-bg)] px-4 py-8">
      <div className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-6xl items-center justify-center">
        <div className="grid min-h-[640px] w-full overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-2xl shadow-slate-950/10 lg:grid-cols-[0.9fr_1.1fr]">
          <section className="hidden bg-blue-700 p-10 text-white lg:flex lg:flex-col lg:justify-between">
            <div>
              <Link
                className="text-3xl font-bold tracking-tight"
                href="/dashboard"
              >
                ClientFlow
              </Link>
              <p className="mt-4 max-w-sm text-lg leading-8 text-blue-50">
                A focused client portal and project management CRM for agencies,
                freelancers, and service teams.
              </p>
            </div>
            <div className="space-y-4">
              {[
                "Protected dashboard routes",
                "Client and project operations",
                "Private file workspace",
              ].map((item) => (
                <div
                  className="rounded-2xl bg-white/10 px-4 py-3 font-semibold"
                  key={item}
                >
                  {item}
                </div>
              ))}
            </div>
          </section>
          <section className="p-6 sm:p-10">
            <div className="mx-auto max-w-md">
              <div>
                <p className="text-sm font-bold uppercase tracking-[0.18em] text-blue-700">
                  ClientFlow CRM
                </p>
                <h1 className="mt-3 text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">
                  {details.title}
                </h1>
                <p className="mt-3 leading-7 text-slate-600">
                  {details.subtitle}
                </p>
              </div>

              {(mode === "login" || mode === "signup") && (
                <>
                  <form action={signInWithGoogle} className="mt-8">
                    <button
                      className="flex h-12 w-full items-center justify-center gap-3 rounded-2xl border border-slate-200 bg-white font-semibold text-slate-800 transition hover:border-blue-200 hover:text-blue-700"
                      disabled={isAuthBusy}
                      type="submit"
                    >
                      <GoogleIcon />
                      Continue with Google
                    </button>
                  </form>
                  <button
                    className="mt-3 flex h-12 w-full items-center justify-center gap-2 rounded-2xl border border-blue-100 bg-blue-50 font-semibold text-blue-700 transition hover:border-blue-200 hover:bg-blue-100 disabled:cursor-not-allowed disabled:border-slate-200 disabled:bg-slate-100 disabled:text-slate-400"
                    disabled={isAuthBusy}
                    onClick={handleDemoLogin}
                    type="button"
                  >
                    {isDemoPending ? (
                      <Loader2 className="size-4 animate-spin" />
                    ) : (
                      <ArrowRight className="size-4" />
                    )}
                    View demo workspace
                  </button>
                  <div className="my-6 flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">
                    <span className="h-px flex-1 bg-slate-200" />
                    or
                    <span className="h-px flex-1 bg-slate-200" />
                  </div>
                </>
              )}

              <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
                {mode === "signup" && (
                  <label className="space-y-2">
                    <span className="text-sm font-semibold text-slate-700">
                      Full name
                    </span>
                    <input className={inputClass} name="fullName" required />
                  </label>
                )}
                {mode !== "reset" && (
                  <label className="space-y-2">
                    <span className="text-sm font-semibold text-slate-700">
                      Email
                    </span>
                    <input
                      className={inputClass}
                      name="email"
                      required
                      type="email"
                    />
                  </label>
                )}
                {mode !== "forgot" && (
                  <label className="space-y-2">
                    <span className="text-sm font-semibold text-slate-700">
                      Password
                    </span>
                    <input
                      className={inputClass}
                      minLength={8}
                      name="password"
                      required
                      type="password"
                    />
                  </label>
                )}
                {feedback ? (
                  <div
                    aria-live={
                      feedback.tone === "error" ? "assertive" : "polite"
                    }
                    className={cn(
                      "rounded-2xl px-4 py-3 text-sm font-semibold",
                      feedback.tone === "error"
                        ? "bg-rose-50 text-rose-700"
                        : "bg-emerald-50 text-emerald-700",
                    )}
                    role={feedback.tone === "error" ? "alert" : "status"}
                  >
                    {feedback.message}
                  </div>
                ) : null}
                <div className="pt-2">
                  <button
                    className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-blue-700 px-5 font-semibold text-white shadow-lg shadow-blue-900/15 transition hover:bg-blue-800 disabled:cursor-not-allowed disabled:bg-slate-300"
                    disabled={isAuthBusy}
                    type="submit"
                  >
                    {isPending ? (
                      <Loader2 className="size-4 animate-spin" />
                    ) : (
                      <ArrowRight className="size-4" />
                    )}
                    {details.cta}
                  </button>
                </div>
              </form>

              <div className="mt-6 flex flex-wrap items-center justify-between gap-3 text-sm font-semibold">
                {mode === "login" ? (
                  <>
                    <Link className="text-blue-700" href="/forgot-password">
                      Forgot password?
                    </Link>
                    <Link className="text-slate-600" href="/signup">
                      Create account
                    </Link>
                  </>
                ) : (
                  <Link className="text-blue-700" href="/login">
                    Back to sign in
                  </Link>
                )}
              </div>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
