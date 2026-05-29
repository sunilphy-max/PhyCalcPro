import { NextResponse } from "next/server";
import { verifyEntitlementToken } from "@/lib/licensing/token";
import { defaultEntitlement } from "@/lib/licensing/entitlements";

export async function POST(request: Request) {
  const body = (await request.json()) as { token?: string };
  if (!body.token) {
    return NextResponse.json({ error: "token is required" }, { status: 400 });
  }

  const entitlement = verifyEntitlementToken(body.token);
  if (!entitlement) {
    return NextResponse.json({ error: "Invalid or expired license" }, { status: 401 });
  }

  return NextResponse.json({ entitlement });
}

export async function GET() {
  return NextResponse.json({ entitlement: defaultEntitlement() });
}
