import type { NextConfig } from "next";

const localDevOrigins = (process.env.NEXT_ALLOWED_DEV_ORIGINS ?? "192.168.8.168")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

const nextConfig: NextConfig = {
  allowedDevOrigins: localDevOrigins,
};

export default nextConfig;
