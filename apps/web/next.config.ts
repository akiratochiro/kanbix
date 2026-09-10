import path from "node:path";
import type { NextConfig } from "next";

// "standalone" só é usado na imagem Docker (o Dockerfile seta BUILD_STANDALONE).
// Na Vercel e no CI o build usa o output padrão do Next.
const isDockerBuild = process.env.BUILD_STANDALONE === "true";

const nextConfig: NextConfig = {
  transpilePackages: ["@kanbix/shared-types"],
  ...(isDockerBuild && {
    output: "standalone",
    // Monorepo: rastreia arquivos a partir da raiz, não só de apps/web.
    outputFileTracingRoot: path.join(__dirname, "../../"),
  }),
};

export default nextConfig;
