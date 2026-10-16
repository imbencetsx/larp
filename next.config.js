/**
 * Run `build` or `dev` with `SKIP_ENV_VALIDATION` to skip env validation. This is especially useful
 * for Docker builds.
 */
import "./src/env.js";

/** @type {import("next").NextConfig} */
const config = {
  // Keep production verification independent from the running dev server.
  distDir: process.env.LARP_BUILD_DIR ?? ".next",
  poweredByHeader: false,
  outputFileTracingIncludes: {
    "/api/trpc/[trpc]": [
      "./generated/simulator-worker.cjs",
      "./node_modules/typescript/lib/**/*",
      "./node_modules/quickjs-emscripten/**/*",
      "./node_modules/quickjs-emscripten-core/**/*",
      "./node_modules/@jitl/**/*",
      "./node_modules/postcss/**/*",
      "./node_modules/linkedom/**/*",
    ],
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          {
            key: "Permissions-Policy",
            value:
              "camera=(), microphone=(), geolocation=(), payment=(), usb=()",
          },
        ],
      },
    ];
  },
};

export default config;
