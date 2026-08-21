import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      bodySizeLimit: "20mb",
      allowedOrigins: ["tatawarga.net", "www.tatawarga.net", "tatawarga.net, tatawarga.net", "localhost:3001", "127.0.0.1:3001", "localhost:3002", "127.0.0.1:3002"],
    },
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
      {
        protocol: "http",
        hostname: "**",
      },
    ],
  },
};

export default nextConfig;
