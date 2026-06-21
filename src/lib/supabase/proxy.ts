import { createServerClient } from "@supabase/ssr";
import { type NextRequest, NextResponse } from "next/server";
import { getSupabaseEnv } from "@/lib/env";

const authRoutes = ["/login", "/signup", "/forgot-password", "/reset-password"];
const publicRoutes = ["/auth/callback"];
const protectedRoutes = [
  "/dashboard",
  "/clients",
  "/projects",
  "/tasks",
  "/invoices",
  "/files",
  "/messages",
  "/settings",
];

function startsWithAny(pathname: string, routes: string[]) {
  return routes.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`),
  );
}

export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request });
  const { publishableKey, url } = getSupabaseEnv();

  const supabase = createServerClient(url, publishableKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        for (const { name, value } of cookiesToSet) {
          request.cookies.set(name, value);
        }

        response = NextResponse.next({ request });

        for (const { name, options, value } of cookiesToSet) {
          response.cookies.set(name, value, options);
        }
      },
    },
  });

  const { data } = await supabase.auth.getClaims();
  const hasUser = Boolean(data?.claims?.sub);
  const pathname = request.nextUrl.pathname;
  const isAuthRoute = startsWithAny(pathname, authRoutes);
  const isPublicRoute = startsWithAny(pathname, publicRoutes);
  const isProtectedRoute = startsWithAny(pathname, protectedRoutes);

  if (!hasUser && isProtectedRoute && !isPublicRoute) {
    const urlToRedirect = request.nextUrl.clone();
    urlToRedirect.pathname = "/login";
    urlToRedirect.searchParams.set("next", pathname);
    return NextResponse.redirect(urlToRedirect);
  }

  if (hasUser && isAuthRoute) {
    const urlToRedirect = request.nextUrl.clone();
    urlToRedirect.pathname = "/dashboard";
    urlToRedirect.search = "";
    return NextResponse.redirect(urlToRedirect);
  }

  return response;
}
