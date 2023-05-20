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
    domains: ["cdn.discordapp.com"],
  },

  experimental: {
    serverActions: true, // https://nextjs.org/docs/app/building-your-application/data-fetching/server-actions
  }
};
export default config;
