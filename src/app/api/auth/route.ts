import { NextResponse } from "next/server";
import { checkRateLimit, clientIpFromRequest } from "@/lib/security/rateLimit";
import { getSupabaseServerClient } from "@/lib/supabaseServer";

type AuthBody = {
  email?: string;
  password?: string;
  displayName?: string;
  mode?: "signin" | "signup" | "reset" | "resend";
};

/**
 * App-owned auth endpoints so we can rate-limit password/OTP abuse before
 * calling Supabase Admin/Auth APIs. Browser clients may still call Supabase
 * directly; pair this with Supabase dashboard Auth rate limits + CAPTCHA.
 */
export async function POST(request: Request) {
  const ip = clientIpFromRequest(request);
  const limited = checkRateLimit(`auth:api:${ip}`, { limit: 20, windowMs: 60_000 });
  if (!limited.ok) {
    return NextResponse.json(
      { error: "Too many authentication attempts. Try again shortly." },
      { status: 429, headers: { "Retry-After": String(limited.retryAfterSec) } }
    );
  }

  if (process.env.NEXT_PUBLIC_SUPABASE_ENABLED !== "true") {
    return NextResponse.json({ error: "Authentication is not configured." }, { status: 503 });
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();
  if (!url || !anonKey) {
    return NextResponse.json({ error: "Authentication is not configured." }, { status: 503 });
  }

  let body: AuthBody;
  try {
    body = (await request.json()) as AuthBody;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const email = body.email?.trim().toLowerCase();
  const password = body.password ?? "";
  const mode = body.mode ?? "signin";

  if (!email || !email.includes("@")) {
    return NextResponse.json({ error: "Valid email is required." }, { status: 400 });
  }

  const emailLimited = checkRateLimit(`auth:email:${email}`, { limit: 8, windowMs: 60_000 });
  if (!emailLimited.ok) {
    return NextResponse.json(
      { error: "Too many attempts for this email. Try again shortly." },
      { status: 429, headers: { "Retry-After": String(emailLimited.retryAfterSec) } }
    );
  }

  const { createClient } = await import("@supabase/supabase-js");
  const supabase = createClient(url, anonKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const appOrigin =
    process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") ||
    new URL(request.url).origin;
  const callback = `${appOrigin}/auth/callback`;

  try {
    if (mode === "reset") {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${callback}?next=/auth/reset-password`,
      });
      if (error) return NextResponse.json({ error: error.message }, { status: 400 });
      return NextResponse.json({ ok: true });
    }

    if (mode === "resend") {
      const { error } = await supabase.auth.resend({
        type: "signup",
        email,
        options: { emailRedirectTo: callback },
      });
      if (error) return NextResponse.json({ error: error.message }, { status: 400 });
      return NextResponse.json({ ok: true });
    }

    if (mode === "signup") {
      if (password.length < 8) {
        return NextResponse.json({ error: "Password must be at least 8 characters." }, { status: 400 });
      }
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: callback,
          data: body.displayName
            ? { display_name: body.displayName, full_name: body.displayName }
            : undefined,
        },
      });
      if (error) return NextResponse.json({ error: error.message }, { status: 400 });
      return NextResponse.json({
        ok: true,
        needsEmailConfirmation: !data.session,
        session: data.session
          ? {
              access_token: data.session.access_token,
              refresh_token: data.session.refresh_token,
              expires_at: data.session.expires_at,
            }
          : null,
      });
    }

    // signin
    if (password.length < 1) {
      return NextResponse.json({ error: "Password is required." }, { status: 400 });
    }
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) return NextResponse.json({ error: error.message }, { status: 401 });
    return NextResponse.json({
      ok: true,
      session: data.session
        ? {
            access_token: data.session.access_token,
            refresh_token: data.session.refresh_token,
            expires_at: data.session.expires_at,
          }
        : null,
    });
  } catch {
    return NextResponse.json({ error: "Authentication request failed." }, { status: 500 });
  }
}

/** Health ping for auth configuration (no secrets). */
export async function GET() {
  const configured =
    process.env.NEXT_PUBLIC_SUPABASE_ENABLED === "true" &&
    Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL?.trim()) &&
    Boolean(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim());
  const serviceRole = Boolean(getSupabaseServerClient());
  return NextResponse.json({ configured, serviceRole });
}
