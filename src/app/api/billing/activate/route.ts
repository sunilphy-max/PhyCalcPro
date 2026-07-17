import { NextResponse } from "next/server";
import type { Entitlement } from "@/lib/licensing/types";
import { signEntitlement, isSigningConfigured } from "@/lib/licensing/token";
import { planById } from "@/lib/licensing/plans";
import { getStripe } from "@/lib/billing/stripe";
import { getUserFromRequest, getSupabaseServerClient } from "@/lib/supabaseServer";
import { checkRateLimit, clientIpFromRequest } from "@/lib/security/rateLimit";

export async function GET(request: Request) {
  if (!isSigningConfigured()) {
    return NextResponse.json(
      { error: "LICENSE_SIGNING_SECRET is not configured." },
      { status: 503 }
    );
  }

  const stripe = getStripe();
  if (!stripe) {
    return NextResponse.json({ error: "Stripe is not configured." }, { status: 503 });
  }

  const ip = clientIpFromRequest(request);
  const limited = checkRateLimit(`billing:activate:${ip}`, { limit: 30, windowMs: 60_000 });
  if (!limited.ok) {
    return NextResponse.json(
      { error: "Too many requests. Try again shortly." },
      { status: 429, headers: { "Retry-After": String(limited.retryAfterSec) } }
    );
  }

  const sessionId = new URL(request.url).searchParams.get("session_id");
  if (!sessionId) {
    return NextResponse.json({ error: "session_id is required" }, { status: 400 });
  }

  try {
    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ["subscription"],
    });

    if (session.payment_status !== "paid" && session.status !== "complete") {
      return NextResponse.json({ error: "Checkout not completed" }, { status: 402 });
    }

    const planId = session.metadata?.planId ?? "pro";
    const plan = planById(planId);
    const tier = plan?.tier ?? "pro";

    let expiresAt: string | null = null;
    let stripeSubscriptionId: string | undefined;

    if (session.mode === "subscription" && session.subscription) {
      const sub =
        typeof session.subscription === "string"
          ? await stripe.subscriptions.retrieve(session.subscription)
          : session.subscription;
      stripeSubscriptionId = sub.id;
      expiresAt = new Date(sub.current_period_end * 1000).toISOString();
    }

    const entitlement: Entitlement = {
      tier,
      expiresAt,
      source: "stripe",
      stripeCustomerId:
        typeof session.customer === "string" ? session.customer : session.customer?.id,
      stripeSubscriptionId,
    };

    const token = signEntitlement(entitlement);

    // When the caller is signed in, persist entitlement to that account only.
    const user = await getUserFromRequest(request);
    if (user) {
      const client = getSupabaseServerClient();
      if (client) {
        await client.from("user_entitlements").upsert({
          userId: user.id,
          token,
          tier: entitlement.tier,
          updatedAt: new Date().toISOString(),
        });
      }
    }

    return NextResponse.json({ token, entitlement });
  } catch {
    return NextResponse.json({ error: "Activation failed" }, { status: 500 });
  }
}
