import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Export estático para copiar al servidor
  output: "export",
  images: { unoptimized: true },
  // Sirviendo bajo sub-ruta
  basePath: "/tbwa/mexana/game-runner",
  assetPrefix: "/tbwa/mexana/game-runner",
  trailingSlash: true,
};

export default nextConfig;
