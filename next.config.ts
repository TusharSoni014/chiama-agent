import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["@mastra/core", "@mastra/pg", "pg"],
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "pub-3b215ec928d840b59e41f77a776731b9.r2.dev",
        pathname: "/chiama.png",
      },
    ],
  },
};

export default nextConfig;
