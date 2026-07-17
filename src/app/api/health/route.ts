import { NextResponse } from "next/server";
import { isSupabaseServerConfigured } from "@/lib/supabaseServer";
import { getBuildInfo } from "@/lib/site/buildInfo";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Minimal readiness probe — no secrets, safe for uptime monitors.
 */
export async function GET() {
  const { version, commitShort } = getBuildInfo();
  const supabaseConfigured = isSupabaseServerConfigured();
  const stripeConfigured = Boolean(process.env.STRIPE_SECRET_KEY?.trim());
  const signingConfigured = Boolean(process.env.LICENSE_SIGNING_SECRET?.trim());

  return NextResponse.json({
    ok: true,
    service: "phycalcpro",
    version,
    commit: commitShort,
    checks: {
      supabase: supabaseConfigured ? "configured" : "off",
      stripe: stripeConfigured ? "configured" : "off",
      licenseSigning: signingConfigured ? "configured" : "off",
    },
    timestamp: new Date().toISOString(),
  });
}
