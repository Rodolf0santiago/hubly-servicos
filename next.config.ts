import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      bodySizeLimit: '10mb'
    }
  },
  turbopack: {
    root: path.join(__dirname, '.')
  }
};

export default nextConfig;
