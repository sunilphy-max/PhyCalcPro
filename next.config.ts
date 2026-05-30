import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: ["10.0.0.59"],
  env: {
    NEXT_PUBLIC_VALIDATION_MODE: process.env.NEXT_PUBLIC_VALIDATION_MODE ?? "",
    NEXT_PUBLIC_DEV_ENTITLEMENT: process.env.NEXT_PUBLIC_DEV_ENTITLEMENT ?? "",
  },
};

export default nextConfig;
