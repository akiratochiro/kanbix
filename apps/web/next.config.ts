import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["@kanbix/shared-types"],
};

export default nextConfig;