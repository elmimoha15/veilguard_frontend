import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Static export: `next build` emits plain HTML/CSS/JS into `out/`, which
  // Firebase Hosting serves directly. The whole site is prerendered (no SSR,
  // API routes, or middleware), so this loses nothing.
  output: "export",
  // Firebase Hosting has no Next image-optimization server, so images are served
  // as-is. (next/image still works — it just skips on-the-fly optimization.)
  images: { unoptimized: true },
};

export default nextConfig;
