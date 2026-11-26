import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  outputFileTracingIncludes: {
    "/api/**/*": ["./src/components/motion-components/**/*"],
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
      },
    ],
  },
  async redirects() {
    return [
      {
        source: "/signup",
        destination: "/login",
        permanent: false,
      },
      {
        source: "/components/liquid-nav-menu",
        destination: "/components/sidebar",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
