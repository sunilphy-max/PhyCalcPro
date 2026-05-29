import { NextResponse } from "next/server";
import { verifyEntitlementToken } from "@/lib/licensing/token";
import { getSupabaseServerClient } from "@/lib/supabaseServer";

export async function GET(request: Request) {
  const userId = request.headers.get("x-phycalc-user-id")?.trim();
  if (!userId) {
    return NextResponse.json({ error: "User id required" }, { status: 400 });
  }

  const client = getSupabaseServerClient();
  if (!client) {
    return NextResponse.json({ stored: false, token: null });
  }

  const { data, error } = await client
    .from("user_entitlements")
    .select("token")
    .eq("userId", userId)
    .maybeSingle();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ stored: Boolean(data?.token), token: data?.token ?? null });
}

export async function POST(request: Request) {
  const userId = request.headers.get("x-phycalc-user-id")?.trim();
  if (!userId) {
    return NextResponse.json({ error: "User id required" }, { status: 400 });
  }

  const body = (await request.json()) as { token?: string };
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
    userId,
    token: body.token,
    tier: entitlement.tier,
    updatedAt: new Date().toISOString(),
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ stored: true });
}
