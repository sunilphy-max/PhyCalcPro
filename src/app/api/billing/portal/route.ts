import { NextResponse } from "next/server";
import { getStripe } from "@/lib/billing/stripe";
import { appBaseUrl } from "@/lib/licensing/billing";

export async function POST(request: Request) {
  const stripe = getStripe();
  if (!stripe) {
    return NextResponse.json({ error: "Stripe is not configured." }, { status: 503 });
  }

  const body = (await request.json()) as { customerId?: string };
  const customerId = body.customerId?.trim();

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
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Portal session failed" },
      { status: 500 }
    );
  }
}
