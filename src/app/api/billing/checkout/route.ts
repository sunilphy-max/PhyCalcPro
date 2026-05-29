import { NextResponse } from "next/server";
import { appBaseUrl, resolveStripePriceId } from "@/lib/licensing/billing";
import { planById } from "@/lib/licensing/plans";
import { getStripe } from "@/lib/billing/stripe";

export async function POST(request: Request) {
  const stripe = getStripe();
  if (!stripe) {
    return NextResponse.json(
      { error: "Stripe is not configured. Set STRIPE_SECRET_KEY and price IDs." },
      { status: 503 }
    );
  }

  const body = (await request.json()) as { planId?: string };
  const planId = body.planId ?? "pro";
  const plan = planById(planId);
  if (!plan?.stripeMode) {
    return NextResponse.json({ error: "Invalid plan" }, { status: 400 });
  }

  const priceId = resolveStripePriceId(planId);
  if (!priceId) {
    return NextResponse.json(
      { error: `Missing Stripe price for plan "${planId}". Set ${plan.stripePriceEnvKey}.` },
      { status: 503 }
    );
  }

  const base = appBaseUrl();

  try {
    const session = await stripe.checkout.sessions.create({
      mode: plan.stripeMode,
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${base}/billing/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${base}/billing/cancel`,
      metadata: { planId: plan.id, tier: plan.tier },
      ...(plan.stripeMode === "subscription"
        ? { subscription_data: { metadata: { planId: plan.id, tier: plan.tier } } }
        : {}),
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Checkout failed" },
      { status: 500 }
    );
  }
}
