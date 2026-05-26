import type { NextConfig } from "next";
import path from "node:path";

const rbacDir = path.join(__dirname, "src/lib/rbac");

const nextConfig: NextConfig = {
  turbopack: {
    resolveAlias: {
      "@rbac": rbacDir,
    },
  },
  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      "@rbac": rbacDir,
    };
    return config;
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "corp-e.s3.ap-south-1.amazonaws.com",
      },
      {
        protocol: "https",
        hostname: "corp-e.s3.amazonaws.com",
      },
    ],
  },
};

export default nextConfig;
