import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typescript: {
    // Temporary: allow production build even with type errors
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;