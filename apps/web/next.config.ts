import path from "node:path";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["@kanbix/shared-types"],
  // Empacota só o necessário para rodar em produção (imagem Docker enxuta).
  output: "standalone",
  // Monorepo: rastreia arquivos a partir da raiz, não só de apps/web.
  outputFileTracingRoot: path.join(__dirname, "../../"),
};

export default nextConfig;
