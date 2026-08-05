import type { NextConfig } from "next";
import { withSentryConfig } from "@sentry/nextjs";

const nextConfig: NextConfig = {
  allowedDevOrigins: ["10.0.0.59"],
  poweredByHeader: false,
  // Prefer /products over /products/ (Next also 308-redirects trailing slashes by default).
  trailingSlash: false,

  async redirects() {
    return [
      // Host canonicalization (www ↔ apex) must be done ONLY in Vercel Domains.
      // Preferred production host: https://www.phycalcpro.com (apex redirects to www).
      // Do not add an opposing host redirect here — that caused ERR_TOO_MANY_REDIRECTS.
      {
        source: "/products/profiles",
        destination: "/products/materials/profiles",
        permanent: true,
      },
      {
        source: "/products/machine/bearings",
        destination: "/products/bearings/designer",
        permanent: true,
      },
      {
        source: "/products/bearings/selection",
        destination: "/products/bearings/designer",
        permanent: true,
      },
      // Absorbed into Bearing System Designer — bookmarks / SEO land on the right panel.
      {
        source: "/products/bearings/life",
        destination: "/products/bearings/designer?intent=design&panel=verify",
        permanent: true,
      },
      {
        source: "/products/bearings/loads",
        destination: "/products/bearings/designer?intent=design&panel=duty",
        permanent: true,
      },
      {
        source: "/products/bearings/speed",
        destination: "/products/bearings/designer?intent=design&panel=verify",
        permanent: true,
      },
      {
        source: "/products/bearings/lubrication",
        destination: "/products/bearings/designer?intent=design&panel=verify",
        permanent: true,
      },
      {
        source: "/products/bearings/mounting",
        destination: "/products/bearings/designer?intent=design&panel=system",
        permanent: true,
      },
      {
        source: "/products/bearings/arrangement",
        destination: "/products/bearings/designer?intent=design&panel=system",
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
      {
        source: "/products/tools/formula-reference",
        destination: "/products/tools/unit-converter",
        permanent: true,
      },
      {
        source: "/products/structural/load-case-manager",
        destination: "/products/tools/unit-converter",
        permanent: true,
      },
      {
        source: "/products/fasteners/safety-factor",
        destination: "/products/tools/unit-converter",
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
