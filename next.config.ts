import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      bodySizeLimit: "15mb",
    },
  },
  // Next's built-in image optimizer (sharp) fails to read files when the
  // project path contains non-ASCII characters (this repo's directory name
  // is Japanese). Self-hosted without a CDN anyway, so skip optimization.
  images: {
    unoptimized: true,
  },
  // Self-hosted behind nginx: disable proxy buffering so streaming responses
  // aren't held back. See DEPLOY.md.
  async headers() {
    return [
      {
        source: "/:path*{/}?",
        headers: [{ key: "X-Accel-Buffering", value: "no" }],
      },
    ];
  },
};

export default nextConfig;
