import type { PlanTier } from "./types";

export type PlanDefinition = {
  id: string;
  tier: PlanTier;
  name: string;
  description: string;
  priceLabel: string;
  features: string[];
  stripeMode?: "payment" | "subscription";
  stripePriceEnvKey?: string;
};

export const plans: PlanDefinition[] = [
  {
    id: "free",
    tier: "free",
    name: "Free",
    description: "Explore every module with indicative engineering checks.",
    priceLabel: "$0",
    features: [
      "All 37 calculation modules",
      "Indicative design basis",
      "CSV export",
      "Saved projects (local)",
    ],
  },
  {
    id: "supporter",
    tier: "supporter",
    name: "Supporter",
    description: "One-time contribution to sustain development.",
    priceLabel: "From $5",
    features: [
      "Everything in Free",
      "Supporter badge in the app",
      "Early access announcements",
    ],
    stripeMode: "payment",
    stripePriceEnvKey: "STRIPE_PRICE_DONATION",
  },
  {
    id: "pro",
    tier: "pro",
    name: "Pro",
    description: "US, EU, and ISO design codes with full PDF reporting.",
    priceLabel: "Monthly",
    features: [
      "US / EU / ISO design standards per module",
      "PDF export with checks & calculation basis",
      "Priority support channel",
      "β code-aligned checks (verification in progress)",
    ],
    stripeMode: "subscription",
    stripePriceEnvKey: "STRIPE_PRICE_PRO_MONTHLY",
  },
];

export function planById(id: string): PlanDefinition | undefined {
  return plans.find((p) => p.id === id);
}
