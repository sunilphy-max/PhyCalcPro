import Stripe from "stripe";
import { isStripeConfigured } from "@/lib/licensing/billing";

let client: Stripe | null = null;

export function getStripe(): Stripe | null {
  if (!isStripeConfigured()) return null;
  if (!client) {
    client = new Stripe(process.env.STRIPE_SECRET_KEY!);
  }
  return client;
}
