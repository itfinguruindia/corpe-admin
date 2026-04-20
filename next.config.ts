import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  // output: "export",
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
