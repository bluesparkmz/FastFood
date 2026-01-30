import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'api.skyvenda.com',
        port: '',
        pathname: '/**',
      },
    ],
  },
};

export default nextConfig;
