import type { NextConfig } from "next";
import { withSentryConfig } from "@sentry/nextjs";

const nextConfig: NextConfig = {
  allowedDevOrigins: ["10.0.0.59"],
  poweredByHeader: false,
  async redirects() {
    return [
      {
        source: "/products/profiles",
        destination: "/products/materials/profiles",
        permanent: true,
      },
      {
        source: "/products/machine/bearings",
        destination: "/products/bearings/selection",
        permanent: true,
      },
      {
        source: "/products/machine/plain-bearings",
        destination: "/products/bearings/plain",
        permanent: true,
      },
      {
        source: "/products/machine/housing",
        destination: "/products/bearings/housing",
        permanent: true,
      },
    ];
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
        ],
      },
    ];
  },
  env: {
    NEXT_PUBLIC_VALIDATION_MODE: process.env.NEXT_PUBLIC_VALIDATION_MODE ?? "",
    NEXT_PUBLIC_FREE_LAUNCH: process.env.NEXT_PUBLIC_FREE_LAUNCH ?? "",
    NEXT_PUBLIC_DEV_ENTITLEMENT: process.env.NEXT_PUBLIC_DEV_ENTITLEMENT ?? "",
  },
};

const sentryEnabled = Boolean(
  process.env.SENTRY_DSN?.trim() || process.env.NEXT_PUBLIC_SENTRY_DSN?.trim()
);

export default sentryEnabled
  ? withSentryConfig(nextConfig, {
      silent: true,
    })
  : nextConfig;
