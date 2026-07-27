import type { NextConfig } from "next"

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "drive.google.com",
      },
    ],
  },
  serverActions: {
    bodySizeLimit: "10mb",
  },
}

export default nextConfig
