/**
 * Run `build` or `dev` with `SKIP_ENV_VALIDATION` to skip env validation. This is especially useful
 * for Docker builds.
 */
await import("./src/env.mjs");

/** @type {import("next").NextConfig} */
const config = {
  reactStrictMode: true,

  typescript: {
    ignoreBuildErrors: true,
  },

  eslint: {
    ignoreDuringBuilds: true
  },

  cleanDistDir: true,

  images: {
    domains: ["cdn.discordapp.com", process.env.NEXT_PUBLIC_R2_PUBLIC_URL],
    dangerouslyAllowSVG: true,
    contentDispositionType: 'attachment',
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },

  poweredByHeader: false,

  headers: async () => [
    {
      source: "/:path*",
      headers: [
        {
          key: "X-DNS-Prefetch-Control",
          value: "on",
        },
        {
          key: "X-Frame-Options",
          value: "SAMEORIGIN",
        },
        {
          key: "Permissions-Policy",
          value: "camera=(), microphone=(), geolocation=()",
        },
        {
          key: "X-Content-Type-Options",
          value: "nosniff",
        },
        {
          key: "Referrer-Policy",
          value: "strict-origin-when-cross-origin",
        },
        {
          key: "Strict-Transport-Security",
          value: "max-age=31536000; includeSubDomains; preload",
        },
      ],
    },
    {
      source: "/meet-the-care-bears-assets/Build/Build.framework.js.br",
      headers: [
        {
          key: "Content-Encoding",
          value: "br",
        },
        {
          key: "Cache-Control",
          value: "private, no-cache, no-store, max-age=0, must-revalidate"
        },
        {
          key: "Content-Type",
          value: "application/javascript",
        },
      ],
    },
    {
      source: "/meet-the-care-bears-assets/Build/Build.data.br",
      headers: [
        {
          key: "Content-Encoding",
          value: "br",
        },
        {
          key: "Cache-Control",
          value: "private, no-cache, no-store, max-age=0, must-revalidate"
        },
        {
          key: "Content-Type",
          value: "application/octet-stream",
        },
      ],
    },
    {
      source: "/meet-the-care-bears-assets/Build/Build.wasm.br",
      headers: [
        {
          key: "Content-Encoding",
          value: "br",
        },
        {
          key: "Cache-Control",
          value: "private, no-cache, no-store, max-age=0, must-revalidate"
        },
        {
          key: "Content-Type",
          value: "application/wasm",
        },
      ],
    }
  ],
};

export default config;
