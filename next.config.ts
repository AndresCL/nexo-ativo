import type { NextConfig } from "next";
import { PHASE_DEVELOPMENT_SERVER } from "next/constants";

export default function criarConfiguracaoNext(fase: string): NextConfig {
  const emServidorDesenvolvimento = fase === PHASE_DEVELOPMENT_SERVER;

  return {
    distDir: emServidorDesenvolvimento ? ".next-dev" : ".next",
    reactStrictMode: true,
    poweredByHeader: false,
    // Garante que <title> e tags og:* / twitter:* sejam sempre renderizados no <head>
    // inicial (sem streaming para o <body>), essencial para crawlers como WhatsApp/Meta.
    htmlLimitedBots: /.*/,
    images: {
      formats: ["image/avif", "image/webp"],
      remotePatterns: [
        {
          protocol: "https",
          hostname: "images.unsplash.com",
        },
        {
          protocol: "https",
          hostname: "firebasestorage.googleapis.com",
        },
        {
          protocol: "https",
          hostname: "storage.googleapis.com",
        },
        {
          protocol: "https",
          hostname: "images.pexels.com",
        },
        {
          protocol: "https",
          hostname: "cdn.beacons.ai",
        },
        {
          protocol: "https",
          hostname: "**.fna.fbcdn.net",
        },
      ],
    },
    async headers() {
      return [
        {
          source: "/(.*)",
          headers: [
            {
              key: "X-Content-Type-Options",
              value: "nosniff",
            },
            {
              key: "Referrer-Policy",
              value: "strict-origin-when-cross-origin",
            },
            {
              key: "X-Frame-Options",
              value: "SAMEORIGIN",
            },
            {
              key: "Cross-Origin-Opener-Policy",
              value: "same-origin-allow-popups",
            },
          ],
        },
      ];
    },
  };
}
