import { NextResponse } from "next/server";
import { requireAuthenticatedUser } from "@/app/api/workspaces/_shared";
import { verifyEntitlementToken } from "@/lib/licensing/token";
import { checkRateLimit } from "@/lib/security/rateLimit";
import { getSupabaseServerClient } from "@/lib/supabaseServer";

export async function GET(request: Request) {
  const auth = await requireAuthenticatedUser(request);
  if (!auth.ok) return auth.response;

  const limited = checkRateLimit(`entitlement:get:${auth.userId}`, { limit: 60, windowMs: 60_000 });
  if (!limited.ok) {
    return NextResponse.json(
      { error: "Too many requests. Try again shortly." },
      { status: 429, headers: { "Retry-After": String(limited.retryAfterSec) } }
    );
  }

  const client = getSupabaseServerClient();
  if (!client) {
    return NextResponse.json({ stored: false, token: null });
  }

  const { data, error } = await client
    .from("user_entitlements")
    .select("token")
    .eq("userId", auth.userId)
    .maybeSingle();

  if (error) {
    return NextResponse.json({ error: "Unable to load entitlement." }, { status: 500 });
  }

  return NextResponse.json({ stored: Boolean(data?.token), token: data?.token ?? null });
}

export async function POST(request: Request) {
  const auth = await requireAuthenticatedUser(request);
  if (!auth.ok) return auth.response;

  const limited = checkRateLimit(`entitlement:post:${auth.userId}`, { limit: 20, windowMs: 60_000 });
  if (!limited.ok) {
    return NextResponse.json(
      { error: "Too many requests. Try again shortly." },
      { status: 429, headers: { "Retry-After": String(limited.retryAfterSec) } }
    );
  }

  let body: { token?: string };
  try {
    body = (await request.json()) as { token?: string };
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  if (!body.token) {
    return NextResponse.json({ error: "token is required" }, { status: 400 });
  }

  const entitlement = verifyEntitlementToken(body.token);
  if (!entitlement) {
    return NextResponse.json({ error: "Invalid entitlement token" }, { status: 400 });
  }

  const client = getSupabaseServerClient();
  if (!client) {
    return NextResponse.json({ stored: false, message: "Cloud sync not configured." });
  }

  const { error } = await client.from("user_entitlements").upsert({
    userId: auth.userId,
    token: body.token,
    tier: entitlement.tier,
    updatedAt: new Date().toISOString(),
  });

  if (error) {
    return NextResponse.json({ error: "Unable to store entitlement." }, { status: 500 });
  }

  return NextResponse.json({ stored: true });
}
