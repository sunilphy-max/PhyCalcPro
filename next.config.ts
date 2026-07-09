import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: ["10.0.0.59"],
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
  env: {
    NEXT_PUBLIC_VALIDATION_MODE: process.env.NEXT_PUBLIC_VALIDATION_MODE ?? "",
    NEXT_PUBLIC_FREE_LAUNCH: process.env.NEXT_PUBLIC_FREE_LAUNCH ?? "",
    NEXT_PUBLIC_DEV_ENTITLEMENT: process.env.NEXT_PUBLIC_DEV_ENTITLEMENT ?? "",
  },
};

export default nextConfig;
