import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // El catálogo referencia imágenes de fabricantes y distribuidores.
    // Se permite cualquier host https; la fuente se registra en ProductImage.
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
    ],
  },
};

export default nextConfig;
