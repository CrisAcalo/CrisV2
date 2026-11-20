import type { NextConfig } from "next";
import { parseProjectImageHosts } from "./src/presentation/utils/projectImageOptimization";

const nextConfig: NextConfig = {
  async headers() {
    const privateHeaders = [
      { key: 'Cache-Control', value: 'private, no-store' },
      { key: 'X-Robots-Tag', value: 'noindex, nofollow' },
    ];
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
          { key: 'Content-Security-Policy', value: "frame-ancestors 'none'; object-src 'none'; base-uri 'self'; form-action 'self'" },
        ],
      },
      { source: '/admin/:path*', headers: privateHeaders },
      { source: '/login', headers: privateHeaders },
    ];
  },
  images: {
    remotePatterns: parseProjectImageHosts(process.env.NEXT_PUBLIC_PROJECT_IMAGE_HOSTS).map((hostname) => ({
      protocol: 'https',
      hostname,
      port: '',
      pathname: '/**',
    })),
    maximumRedirects: 0,
  },
};

export default nextConfig;
