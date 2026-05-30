import type { NextConfig } from "next";

const appUrl = process.env.NEXT_PUBLIC_APP_URL;
const appHost = appUrl ? new URL(appUrl).host : undefined;

const nextConfig: NextConfig = {
  allowedDevOrigins: appHost ? [appHost] : [],
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "cdn.shopify.com",
      },
    ],
  },
};

export default nextConfig;
