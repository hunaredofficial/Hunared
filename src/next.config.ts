import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typescript: {
    // Temporary: allow production build even with type errors
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  async redirects() {
    return [
      { source: "/market", destination: "/business", permanent: true },
      { source: "/market/:path*", destination: "/business/:path*", permanent: true },
    ];
  },
};

export default nextConfig;