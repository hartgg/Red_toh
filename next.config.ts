import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "uqqijxmhnyzmaqvuyfng.supabase.co",
      },
    ],
  },
};

export default nextConfig;