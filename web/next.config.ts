import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Standalone output for Cloud Run / container deploys.
  output: "standalone",
};

export default nextConfig;
