/** Inlined at build time from .env.local — see next.config.ts env passthrough. */
export const publicEnv = {
  validationMode: process.env.NEXT_PUBLIC_VALIDATION_MODE === "true",
  devEntitlement: (process.env.NEXT_PUBLIC_DEV_ENTITLEMENT ?? "").trim().toLowerCase(),
  nodeEnv: process.env.NODE_ENV ?? "production",
} as const;

export function isDevServer(): boolean {
  return publicEnv.nodeEnv === "development";
}
