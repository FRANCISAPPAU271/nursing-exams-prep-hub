import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Emits .next/standalone with a self-contained server.js for Docker / VPS deploys.
  output: "standalone",
  outputFileTracingRoot: process.cwd(),
};

export default nextConfig;
