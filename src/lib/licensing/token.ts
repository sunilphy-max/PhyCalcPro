import { createHmac, timingSafeEqual } from "crypto";
import type { Entitlement, PlanTier } from "./types";

const TOKEN_VERSION = "v1";

function secret(): string {
  return process.env.LICENSE_SIGNING_SECRET ?? "";
}

export function isSigningConfigured(): boolean {
  return secret().length >= 16;
}

export function signEntitlement(entitlement: Entitlement): string {
  const key = secret();
  if (!key) throw new Error("LICENSE_SIGNING_SECRET is not configured");

  const payload = JSON.stringify({
    v: TOKEN_VERSION,
    tier: entitlement.tier,
    expiresAt: entitlement.expiresAt,
    source: entitlement.source,
    stripeCustomerId: entitlement.stripeCustomerId ?? null,
    stripeSubscriptionId: entitlement.stripeSubscriptionId ?? null,
  });

  const sig = createHmac("sha256", key).update(payload).digest("base64url");
  const body = Buffer.from(payload, "utf8").toString("base64url");
  return `${body}.${sig}`;
}

export function verifyEntitlementToken(token: string): Entitlement | null {
  const key = secret();
  if (!key) return null;

  const [body, sig] = token.split(".");
  if (!body || !sig) return null;

  const payload = Buffer.from(body, "base64url").toString("utf8");
  const expected = createHmac("sha256", key).update(payload).digest("base64url");

  try {
    const a = Buffer.from(sig);
    const b = Buffer.from(expected);
    if (a.length !== b.length || !timingSafeEqual(a, b)) return null;
  } catch {
    return null;
  }

  const parsed = JSON.parse(payload) as {
    v: string;
    tier: PlanTier;
    expiresAt: string | null;
    source: Entitlement["source"];
    stripeCustomerId: string | null;
    stripeSubscriptionId: string | null;
  };

  if (parsed.v !== TOKEN_VERSION) return null;
  if (parsed.expiresAt && new Date(parsed.expiresAt).getTime() < Date.now()) {
    return { tier: "free", expiresAt: null, source: "default" };
  }

  return {
    tier: parsed.tier,
    expiresAt: parsed.expiresAt,
    source: parsed.source,
    stripeCustomerId: parsed.stripeCustomerId ?? undefined,
    stripeSubscriptionId: parsed.stripeSubscriptionId ?? undefined,
  };
}
