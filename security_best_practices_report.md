# LARP security hardening

Reviewed: 2026-10-16. Scope: Next.js/React, Clerk and guest sessions, tRPC, Drizzle, simulator compilation/execution, and preview frames.

## Summary

Implemented the requested hardening and removed dashboard course icons while retaining the pixel artwork. Learner JavaScript now runs in QuickJS inside bounded workers; interactive previews receive sanitized HTML and replay typed events through that VM. Requests and guest identities have explicit validation and resource limits. This review does not establish that the application is vulnerability-free.

## High severity findings addressed

1. **Untrusted compilation and execution could block the web server.** Moved simulation, validation, type checking, and project export into a pool of two Node workers. Each job has a three-second deadline; the queue holds at most eight jobs. Worker V8 heap limits, QuickJS memory/stack/time limits, and bounded promise draining constrain hostile programs. Workers receive no application secrets in their environment. Evidence: `src/server/services/execution-pool.ts:20`, `src/server/services/execution-pool.ts:39`, `src/server/services/execution-pool.ts:104`, `src/server/services/execution-core.ts:46`, `src/server/services/execution-core.ts:82`.

2. **Interactive previews executed learner JavaScript in the browser.** Removed that execution path. DOM projects now run against a synthetic DOM in QuickJS and return an escaped, allowlisted tree with depth/node limits. DOMPurify removes active content and external resources before preview insertion. An application-owned nonce-authorized bridge sends bounded events; the parent verifies source window, opaque origin, channel, and payload. Frames omit same-origin permission and have a restrictive CSP blocking outbound connections and form actions. Evidence: `src/server/services/execution-core.ts:607`, `src/server/services/execution-core.ts:653`, `src/lib/preview-document.ts:39`, `src/lib/preview-document.ts:64`, `src/lib/preview-document.ts:134`, `src/components/larp/code-workspace.tsx:340`, `src/components/larp/code-workspace.tsx:445`.

3. **Dependency audit identified vulnerable installed dependencies.** Updated Drizzle ORM/Kit, PostCSS, and esbuild, including transitive overrides. Disabled PostCSS source-map handling on learner CSS. The final audit reports only the unresolved `braces` advisory described below. Evidence: `package.json`, `bun.lock`, `src/server/services/execution-core.ts:769`.

## Medium severity findings addressed

4. **Guest identity was trusted from an unsigned cookie.** Guest cookies now contain a versioned UUID, issuance time, and HMAC-SHA256 signature. Verification checks signature, format, expiry, and future timestamps before creating a learner context. Invalid cookies rotate; valid cookies are HttpOnly, SameSite=Lax, and Secure on HTTPS. Production requires a signing secret. Evidence: `src/lib/guest-session.ts:28`, `src/lib/guest-session.ts:41`, `src/middleware.ts:26`, `src/server/api/trpc.ts:13`.

   Existing unsigned guest cookies rotate once, so old anonymous progress is not automatically linked. Signed-in account progress remains associated with its Clerk identity.

5. **Mutation origin checks were insufficient.** API mutations require an exact origin match including scheme and port, reject missing/null origins and cross-site fetch metadata, and do not trust forwarded-host headers. POST bodies must use JSON. Learner procedures enforce the origin check as well as the transport handler. Database reads/writes remain scoped to the authenticated or verified guest learner. Evidence: `src/server/security.ts:1`, `src/app/api/trpc/[trpc]/route.ts:44`, `src/server/api/trpc.ts:38`, `src/server/api/routers/learning.ts:29`.

6. **Requests and preview messages needed resource bounds.** Added a 256 KiB streamed body limit, five-second body read deadline, 12,000-character URL limit, maximum four batched operations, bounded rate-limiter storage, per-learner throttles, and an instance-wide transport limit. Preview event history, field counts, values, and worker output are capped. Personalized API responses use `private, no-store`. Evidence: `src/server/security.ts:19`, `src/server/security.ts:44`, `src/app/api/trpc/[trpc]/route.ts:37`, `src/app/api/trpc/[trpc]/route.ts:61`, `src/server/api/trpc.ts:56`, `src/lib/preview-document.ts:4`, `src/server/services/execution-worker.ts:16`.

7. **Browser policies and error responses needed tightening.** Added a per-request nonce CSP with production script restrictions, clickjacking protection, MIME-sniffing protection, referrer and permissions policies. Production internal tRPC errors use a generic message. Clerk-specific policy hosts are derived from configuration. Evidence: `src/lib/content-policy.ts:1`, `src/middleware.ts:17`, `next.config.js:27`, `src/server/api/trpc.ts:19`.

## Remaining findings and deployment limits

8. **High advisory; build-tool exposure: unpatched `braces`.** `bun audit --json` still reports [GHSA-vfj7-8cjw-p6xm](https://github.com/advisories/GHSA-vfj7-8cjw-p6xm) for `braces <=3.0.3`. No patched upstream release was available during this review. It is present through glob/build tooling; no inspected simulator or application endpoint passes learner input to its pattern parser. Keep build glob patterns trusted and update when a fix is released. The audit is not clean.

9. **Deployment boundary: worker threads are not an OS sandbox.** QuickJS provides the learner execution boundary; worker deadlines isolate CPU-heavy compiler/parser work from the web event loop. V8 worker limits do not bound every native allocation, and threads still share an OS process. For sustained hostile public workloads, move execution to a separate restricted service/container with OS memory/CPU, filesystem, and network restrictions. Evidence: `src/server/services/execution-pool.ts:35`.

10. **Deployment boundary: rate limits are per instance.** The in-memory limiter is bounded but resets on restart and is not shared between replicas. Add a shared or edge limiter before scaling to multiple instances. Anonymous users can obtain fresh guest identities; global transport and worker caps limit the local impact. Evidence: `src/server/security.ts:19`, `src/app/api/trpc/[trpc]/route.ts:37`.

## Configuration and compatibility

- Set `APP_ORIGIN` in `.env` to the actual public origin, including a nonstandard port if applicable. The local example is `http://localhost:3000`.
- Configure Clerk with `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` and `CLERK_SECRET_KEY`. Guest-only production additionally needs `GUEST_SESSION_SECRET` with at least 32 random characters; configured Clerk can supply the server-side signing secret instead. See `.env.example:6` and `src/env.js:13`.
- Keep Drizzle schema and migrations in Git; local database files and secrets remain ignored. No schema changes were required.
- Simulator previews intentionally support the curriculum's synthetic DOM/React APIs, with no real network, browser storage, arbitrary package loading, or server filesystem access. Exported projects can be run separately for full browser/framework behavior.
- `dev`, `build`, `preview`, and unit tests build the worker artifact. Restart development after changing simulator server code so pooled workers load the new bundle. Production tracing includes the worker and its runtime dependencies.
- Clerk login with real credentials was not exercised; guest flows and Clerk-compatible policy configuration were inspected.

## Validation

- 357 unit/curriculum/security tests passed.
- All 12 learning browser checks passed across the full run and targeted retry, including submission of all 160 lessons, quizzes, five capstones, persistence, garden growth, mobile layouts, and separate Run/Submit behavior. The retry corrected test selectors and route synchronization.
- Three additional browser security checks passed: active-content/outbound-request blocking, API request guards, and signed-cookie rotation/dashboard artwork.
- Lint, TypeScript checking, and production build passed. A production server smoke check returned a successful simulator result through the bundled worker.
- `drizzle-kit check --dialect sqlite --out drizzle` passed.
- Dependency audit: one remaining advisory, finding 8.
