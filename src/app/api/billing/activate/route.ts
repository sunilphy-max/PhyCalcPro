import { NextResponse } from "next/server";
import type { Entitlement } from "@/lib/licensing/types";
import { signEntitlement, isSigningConfigured } from "@/lib/licensing/token";
import { planById } from "@/lib/licensing/plans";
import { getStripe } from "@/lib/billing/stripe";

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

    return NextResponse.json({ token, entitlement });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Activation failed" },
      { status: 500 }
    );
  }
}
