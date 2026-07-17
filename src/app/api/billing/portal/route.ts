import { NextResponse } from "next/server";
import { requireAuthenticatedUser } from "@/app/api/workspaces/_shared";
import { getStripe } from "@/lib/billing/stripe";
import { appBaseUrl } from "@/lib/licensing/billing";
import { verifyEntitlementToken } from "@/lib/licensing/token";
import { checkRateLimit } from "@/lib/security/rateLimit";
import { getSupabaseServerClient } from "@/lib/supabaseServer";

export async function POST(request: Request) {
  const auth = await requireAuthenticatedUser(request);
  if (!auth.ok) return auth.response;

  const limited = checkRateLimit(`billing:portal:${auth.userId}`, { limit: 10, windowMs: 60_000 });
  if (!limited.ok) {
    return NextResponse.json(
      { error: "Too many requests. Try again shortly." },
      { status: 429, headers: { "Retry-After": String(limited.retryAfterSec) } }
    );
  }

  const stripe = getStripe();
  if (!stripe) {
    return NextResponse.json({ error: "Stripe is not configured." }, { status: 503 });
  }

  const client = getSupabaseServerClient();
  if (!client) {
    return NextResponse.json({ error: "Cloud account storage is not configured." }, { status: 503 });
  }

  const { data, error } = await client
    .from("user_entitlements")
    .select("token")
    .eq("userId", auth.userId)
    .maybeSingle();

  if (error) {
    return NextResponse.json({ error: "Unable to load billing profile." }, { status: 500 });
  }

  const entitlement = data?.token ? verifyEntitlementToken(data.token) : null;
  const customerId = entitlement?.stripeCustomerId?.trim();

  if (!customerId) {
    return NextResponse.json(
      { error: "Stripe customer ID required. Complete Pro checkout first." },
      { status: 400 }
    );
  }

  try {
    const session = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: `${appBaseUrl()}/account`,
    });
    return NextResponse.json({ url: session.url });
  } catch {
    return NextResponse.json({ error: "Portal session failed" }, { status: 500 });
  }
}
