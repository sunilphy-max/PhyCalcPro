export type PlanTier = "free" | "supporter" | "pro";

export type Entitlement = {
  tier: PlanTier;
  expiresAt: string | null;
  source: "default" | "stripe" | "dev";
  stripeCustomerId?: string;
  stripeSubscriptionId?: string;
};

export type SignedEntitlement = Entitlement & {
  token: string;
};
