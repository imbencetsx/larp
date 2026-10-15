/**
 * Run `build` or `dev` with `SKIP_ENV_VALIDATION` to skip env validation. This is especially useful
 * for Docker builds.
 */
import "./src/env.js";

/** @type {import("next").NextConfig} */
const config = {
  // Keep production verification independent from the running dev server.
  distDir: process.env.LARP_BUILD_DIR ?? ".next",
};

export default config;
