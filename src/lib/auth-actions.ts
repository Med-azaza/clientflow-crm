"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";

type AuthResult = {
  ok: boolean;
  error?: string;
  message?: string;
  redirectTo?: string;
};

const emailSchema = z.string().trim().email("Enter a valid email address.");
const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters.");

const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, "Enter your password."),
});

const signupSchema = z.object({
  email: emailSchema,
  fullName: z.string().trim().min(2, "Enter your full name."),
  password: passwordSchema,
});

const resetSchema = z.object({
  password: passwordSchema,
});

function authError(error: unknown): AuthResult {
  if (error instanceof z.ZodError) {
    return {
      error: error.issues[0]?.message ?? "Validation failed.",
      ok: false,
    };
  }

  if (error instanceof Error) {
    return { error: error.message, ok: false };
  }

  return { error: "Authentication failed.", ok: false };
}

async function getOrigin() {
  const headerStore = await headers();
  const host = headerStore.get("host") ?? "localhost:3000";
  const protocol = host.includes("localhost") ? "http" : "https";

  return `${protocol}://${host}`;
}

export async function signInWithPassword(input: unknown): Promise<AuthResult> {
  try {
    const values = loginSchema.parse(input);
    const supabase = await createClient();
    const { error } = await supabase.auth.signInWithPassword(values);

    if (error) {
      throw new Error(error.message);
    }

    await supabase.rpc("ensure_user_workspace");
    return { message: "Signed in.", ok: true, redirectTo: "/dashboard" };
  } catch (error) {
    return authError(error);
  }
}

export async function signUpWithPassword(input: unknown): Promise<AuthResult> {
  try {
    const values = signupSchema.parse(input);
    const supabase = await createClient();
    const origin = await getOrigin();
    const { data, error } = await supabase.auth.signUp({
      email: values.email,
      options: {
        data: { full_name: values.fullName },
        emailRedirectTo: `${origin}/auth/callback`,
      },
      password: values.password,
    });

    if (error) {
      throw new Error(error.message);
    }

    if (data.session) {
      await supabase.rpc("ensure_user_workspace");
      return {
        message: "Account created.",
        ok: true,
        redirectTo: "/dashboard",
      };
    }

    return {
      message: "Check your email to confirm your account, then sign in.",
      ok: true,
    };
  } catch (error) {
    return authError(error);
  }
}

export async function signInWithGoogle() {
  const supabase = await createClient();
  const origin = await getOrigin();
  const { data, error } = await supabase.auth.signInWithOAuth({
    options: {
      redirectTo: `${origin}/auth/callback`,
    },
    provider: "google",
  });

  if (error || !data.url) {
    redirect(
      `/login?error=${encodeURIComponent(error?.message ?? "OAuth failed")}`,
    );
  }

  redirect(data.url);
}

export async function requestPasswordReset(
  input: unknown,
): Promise<AuthResult> {
  try {
    const email = emailSchema.parse(
      typeof input === "object" && input && "email" in input
        ? (input as { email: unknown }).email
        : input,
    );
    const supabase = await createClient();
    const origin = await getOrigin();
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${origin}/auth/callback?next=/reset-password`,
    });

    if (error) {
      throw new Error(error.message);
    }

    return { message: "Password reset email sent.", ok: true };
  } catch (error) {
    return authError(error);
  }
}

export async function updatePassword(input: unknown): Promise<AuthResult> {
  try {
    const values = resetSchema.parse(input);
    const supabase = await createClient();
    const { error } = await supabase.auth.updateUser({
      password: values.password,
    });

    if (error) {
      throw new Error(error.message);
    }

    return { message: "Password updated.", ok: true, redirectTo: "/dashboard" };
  } catch (error) {
    return authError(error);
  }
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}
