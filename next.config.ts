import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",

  basePath: "/hisabpro",

  trailingSlash: true,

  images: {
    unoptimized: true,
  },
};

export default nextConfig;
