import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

function authErrorRedirect(origin: string, message: string) {
  const url = new URL("/auth/error", origin);
  url.searchParams.set("message", message);
  return NextResponse.redirect(url);
}

/**
 * Exchanges the auth code from email links (magic link, signup confirm, recovery)
 * for a cookie-backed session, then redirects to `next` or /account.
 */
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const nextPath = searchParams.get("next") || "/account";
  const safeNext = nextPath.startsWith("/") ? nextPath : "/account";

  const errorDescription =
    searchParams.get("error_description") || searchParams.get("error");

  if (errorDescription) {
    return authErrorRedirect(origin, errorDescription);
  }

  if (!code) {
    // Implicit/hash flows land on the client; send them to account.
    return NextResponse.redirect(new URL(safeNext, origin));
  }

  if (process.env.NEXT_PUBLIC_SUPABASE_ENABLED !== "true") {
    return authErrorRedirect(origin, "Authentication is not configured.");
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();
  if (!url || !anonKey) {
    return authErrorRedirect(origin, "Authentication is not configured.");
  }

  const cookieStore = await cookies();
  const supabase = createServerClient(url, anonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value, options }) => {
          cookieStore.set(name, value, options);
        });
      },
    },
  });

  const { error } = await supabase.auth.exchangeCodeForSession(code);
  if (error) {
    return authErrorRedirect(origin, error.message || "Invalid or expired link.");
  }

  return NextResponse.redirect(new URL(safeNext, origin));
}
