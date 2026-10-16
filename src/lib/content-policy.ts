export function contentPolicy(nonce: string) {
  let clerk = "";
  try {
    const value = atob(
      process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY?.split("_")[2] ?? "",
    ).replace(/\$$/, "");
    if (/^[a-z0-9.-]+$/i.test(value)) clerk = `https://${value}`;
  } catch {
    /* Guest-only mode has no Clerk host. */
  }
  const development = process.env.NODE_ENV !== "production";
  return [
    "default-src 'self'",
    `script-src 'self' 'nonce-${nonce}' 'strict-dynamic'${development ? " 'unsafe-eval'" : ""}`,
    "style-src 'self' 'unsafe-inline'",
    `connect-src 'self' ${clerk} https://*.protect.clerk.com:* https://clerk-telemetry.com https://*.clerk-telemetry.com${development ? " ws: wss:" : ""}`,
    "img-src 'self' data: blob: https://img.clerk.com",
    "font-src 'self' data:",
    "frame-src 'self' https://challenges.cloudflare.com https://*.protect.clerk.com",
    "worker-src 'self' blob:",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
  ].join("; ");
}
