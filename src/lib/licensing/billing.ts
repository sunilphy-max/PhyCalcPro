import { planById } from "./plans";

export function isStripeConfigured(): boolean {
  return Boolean(process.env.STRIPE_SECRET_KEY?.trim());
}

export function resolveStripePriceId(planId: string): string | null {
  const plan = planById(planId);
  if (!plan?.stripePriceEnvKey) return null;
  const value = process.env[plan.stripePriceEnvKey];
  return value?.trim() || null;
}

export function appBaseUrl(): string {
  const url = process.env.NEXT_PUBLIC_APP_URL?.trim();
  if (url) return url.replace(/\/$/, "");
  return "http://localhost:3000";
}
