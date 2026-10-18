# LARP

A programming learning app built on the existing T3 Stack: Next.js App Router, TypeScript, tRPC, Drizzle, SQLite/libSQL, Clerk, Tailwind CSS v4, and coss/Base UI.

## Run locally

```sh
bun install
# For a fresh checkout only; preserve your existing .env if you have one.
cp .env.example .env
bun run db:migrate
bun run db:seed
bun run dev
```

Open [localhost:3000](http://localhost:3000). The workspace is at `/`; the introduction is at `/welcome`.

The default `DATABASE_URL` is `file:./db.sqlite`. Migrations are checked in under `drizzle/`. Seeding is repeatable and never adds artificial user progress. The app inserts missing course and lesson catalog records on the first progress write, after migrations have run. Progress reads do not synchronize the catalog. Run `bun run db:seed` after curriculum changes to refresh stored lesson content.

## Clerk authentication

Create a Clerk application and set these in `.env`:

```dotenv
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="your Clerk publishable key"
CLERK_SECRET_KEY="your Clerk secret key"
```

Restart the dev server after adding keys. The actual Clerk sign-up, sign-in, account, and sign-out UI will then be available. Configure any desired social providers in Clerk itself. See the [official Clerk App Router quickstart](https://clerk.com/docs/nextjs/getting-started/quickstart).

Sign-in is required for all learning pages and learning API requests. Without both Clerk keys, learning remains unavailable and the sign-in page shows an availability message. Existing signed guest cookies are only used to transfer earlier guest progress into an account after sign-in; new guest sessions are no longer created.

Browser tests for learning features need an authenticated Clerk session. Set `PLAYWRIGHT_STORAGE_STATE` to a Playwright storage-state JSON file saved after signing in to the configured local Clerk application. Keep this file outside the repository because it contains session credentials. The authentication tests use an empty session to verify redirects and rejected API requests.

## What is included

- Five learning paths: HTML, CSS, JavaScript, TypeScript, and Next.js.
- Ten complete lessons per path, fifty in total. Each includes a worked example, copyable snippet, guided explanation, starter code, a project-based exercise, progressive hints, server-side checks, and a recap. Each path builds toward a small capstone.
- A dashboard, course overviews, lesson workspace, freeform playground, garden, progress history, and settings.
- Viewport-sized coding workspaces: tasks, code, and output sit side by side on desktop. Phones keep code and preview stacked together; instructions and hints open in a dialog. Individual panes scroll, so long code never pushes the preview below the page.
- Saved lesson drafts, exercise attempts, completion dates, daily intentions, and preferences. Unique completion is recorded only once per lesson.
- Five distinct course flowers: HTML daisy, CSS lavender, JavaScript sunflower, TypeScript bluebell, and Next.js rose. Each has 12 pixel-art stages. Server-verified exercise checks save the best growth per lesson; only completing every lesson in a course unlocks its full bloom. All five plants grow together in the garden, with an interactive growth-stage guide. Failed attempts and resets never remove earned growth.
- Tiny5 for the wordmark, headings, and numbers; Pixelify Sans for interface text; Geist Mono for code. Five original pixel-art greenhouse scenes give each language path its own setting.
- Consistent coss component surfaces with the default radius scale, borders, shadows, focus rings, and control variants. Pixel typography is mapped through coss font tokens; page CSS handles layout and the code canvas.
- Dark surfaces, top-bar navigation, keyboard shortcuts, reduced-motion support, and coss cards, menus, tooltips, form fields, dialogs, tabs, selects, inputs, buttons, badges, skeletons, and progress indicators.

## Exercise environments

- **HTML/CSS:** live previews in a sandboxed iframe. A restrictive Content Security Policy blocks scripts, external assets, and forms. HTML structure and CSS declarations are checked against each lesson’s requirements.
- **JavaScript:** server-side QuickJS/WASM with a 150ms interrupt deadline, an 8 MiB guest heap limit, a bounded stack, and capped console output. Learner JavaScript has no Node, network, or filesystem APIs. The final HTML project lesson uses a small controlled DOM fixture and renders generated cards in the sandboxed preview.
- **TypeScript:** real compiler diagnostics before execution. The compiler can read the exercise and TypeScript's standard library, not arbitrary project files. Valid code is compiled and run in QuickJS.
- **Next.js:** an explicitly labeled educational component simulator. It supports JSX, a minimal `useState` model, rendered snapshots, and explicit simulated button clicks. It teaches file-based routing and server/client boundaries; it does **not** start a Next.js server, fetch data, run arbitrary dependencies, or provide a complete React runtime.

Source input is limited to 12,000 characters. Exercises and the playground run through typed tRPC procedures. Only successful server validation marks a lesson complete. Atomic database batches prevent simultaneous submissions from duplicating completion. Replaying or resetting an exercise never removes earned completion.

Playground drafts are stored on the current device; lesson drafts and learning progress are in the database.

## Add curriculum

Author a lesson with the `Lesson` type and its matching validation checks in `src/content/continuation.ts`. Stable lesson IDs use the track name and sequence number. Catalog entries are synchronized automatically on a learning request; run `bun run db:seed` to update them explicitly.

## Verification

```sh
bun run test          # curriculum, sandbox, persistence, growth, and authorization checks
bun run typecheck
bun run lint
bun run build
```

End-to-end tests run in a separate browser context against a running development server:

```sh
bunx playwright install chromium
bun run dev          # in another terminal
bun run test:e2e
```

The browser suite covers curriculum completion, completion deduplication, reload persistence, saved drafts, clipboard copying, hints, settings, playground output, infinite-loop interruption, Next.js state simulation, mobile navigation, search, and overflow checks.

To build without sharing Next's output directory with a running dev server:

```sh
LARP_BUILD_DIR=.next-production bun run build
LARP_BUILD_DIR=.next-production bun run start
```

The strict ESLint configuration applies to application code. Imported coss registry files and their supporting generated hooks/composer helpers are excluded from linting but remain included in TypeScript checks.

## Deployment

Use persistent disk for a local SQLite deployment. For serverless hosting, configure a persistent hosted libSQL/Turso database using `DATABASE_URL="libsql://..."` and `DATABASE_AUTH_TOKEN`. The Drizzle configuration selects the Turso dialect for a libSQL URL. Run migrations and the seed command against that target before serving traffic. Local SQLite files are not durable on ephemeral serverless filesystems.

Set Clerk production keys and the production domain in Clerk before enabling account authentication on a deployed site. Run the application with the Node.js runtime; exercise validation depends on WASM and the TypeScript compiler.

## Vercel deployment

For a new deployment, open the Vercel project’s **Storage** page, create a
**Turso Cloud** database, and connect it to the project. The integration creates
`TURSO_DATABASE_URL` and `TURSO_AUTH_TOKEN`; LARP and Drizzle automatically use
that pair, overriding any old local `DATABASE_URL` setting.

In the storage connection's deployment actions, enable database branching for
**Preview only**. Production must use the stable connected database; enabling
the `branch` action for Production creates an isolated database for each release
and prevents learner progress from carrying over between deployments.

Vercel deployments automatically run `bun run db:setup && bun run build`, as
configured in `vercel.json`. This applies pending checked-in migrations and
synchronizes the lesson catalog before the new deployment serves traffic.
Existing learner progress is preserved. Keep this build command enabled so new
or reconnected databases always have the required tables.

The setup runs inside Vercel, where the connected credentials are available.
Vercel Secret values are write-only: `vercel env pull` returns `[SENSITIVE]`
placeholders, so a downloaded production env file cannot initialize the
database locally.

If you already have the real hosted credentials in a local ignored env file,
you can instead run `bun --env-file=<your-env-file> run db:setup` locally.

`db:setup` creates the tables and synchronizes the lesson catalog. It does not
copy local learner progress. Redeploy the application after connecting storage
and initializing the database.

Alternatively, configure the connection manually:

Set `DATABASE_URL` to a hosted libSQL/Turso URL (`libsql://…`) and set
`DATABASE_AUTH_TOKEN` in the Vercel environment. Local `file:` SQLite databases
cannot persist progress on Vercel. Run `bun run db:migrate` and `bun run db:seed`
against that hosted database before deploying.

Set `APP_ORIGIN` to the deployed HTTPS origin (for example,
`https://larplang.vercel.app`). Guest-only deployments also need a random
`GUEST_SESSION_SECRET` of at least 32 characters.

For Clerk on `larplang.vercel.app`, configure live keys from the same production
instance in the Vercel **Production** environment:

- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_…`
- `CLERK_SECRET_KEY=sk_live_…`

The app uses `@clerk/nextjs` 7.9.17 or newer, which supports automatic Frontend
API proxying on production `*.vercel.app` hosts. Its app-origin proxy URL is
`https://larplang.vercel.app/__clerk`. The middleware matcher explicitly includes
`/__clerk/:path*`, including proxy requests for JavaScript assets that the normal
static-file matcher excludes. Let Clerk auto-detect the proxy; explicit
`proxyUrl` or `domain` overrides disable automatic detection. Redeploy after
changing keys or upgrading the SDK. Do not configure DNS records for `vercel.app`.

Sign-in, sign-up, verification-code emails, and password-reset code emails can
use Clerk's shared `accounts.dev` email infrastructure. Use code-based email
flows for this deployment. A custom domain is preferred when full branded
production behavior, custom email templates, email-link authentication, app
invitations, organization invitations, or email-template customization are
needed.

The learning API logs procedure failures and startup failures in Vercel's
function logs. An HTML 500 returned by `/api/trpc/learning.overview` means the
service failed before producing a tRPC response; inspect those logs for the
underlying configuration, database, or module error.
