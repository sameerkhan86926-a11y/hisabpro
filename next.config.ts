import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",

  basePath: "/hisabpro",
  assetPrefix: "/hisabpro/",

  trailingSlash: true,

  images: {
    unoptimized: true
  }
};

export default nextConfig;
