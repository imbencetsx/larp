import { clerkMiddleware } from "@clerk/nextjs/server";
import {
  NextResponse,
  type NextRequest,
  type NextFetchEvent,
} from "next/server";
import { contentPolicy } from "~/lib/content-policy";
const configured = Boolean(
  process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY && process.env.CLERK_SECRET_KEY,
);
function withContentPolicy(request: NextRequest) {
  const nonce = btoa(
    String.fromCharCode(...crypto.getRandomValues(new Uint8Array(16))),
  );
  const policy = contentPolicy(nonce);
  request.headers.set("x-nonce", nonce);
  request.headers.set(
    "x-larp-path",
    request.nextUrl.pathname + request.nextUrl.search,
  );
  request.headers.set("Content-Security-Policy", policy);
  const response = NextResponse.next({ request: { headers: request.headers } });
  response.headers.set("Content-Security-Policy", policy);
  return response;
}
function isPublicPage(request: NextRequest) {
  return (
    /^\/(sign-in|sign-up)(\/|$)/.test(request.nextUrl.pathname) ||
    request.nextUrl.pathname === "/welcome"
  );
}
function signInRequired(request: NextRequest) {
  if (/^\/(api|trpc)(\/|$)/.test(request.nextUrl.pathname)) {
    return NextResponse.json(
      { error: "Sign in to continue learning." },
      { status: 401 },
    );
  }
  const url = new URL("/sign-in", request.url);
  url.searchParams.set(
    "redirect_url",
    request.nextUrl.pathname + request.nextUrl.search,
  );
  return NextResponse.redirect(url);
}
const withClerk = clerkMiddleware(async (auth, request) => {
  if (!isPublicPage(request)) {
    const { userId } = await auth();
    if (!userId) return signInRequired(request);
  }
  return withContentPolicy(request);
});
export default function middleware(
  request: NextRequest,
  event: NextFetchEvent,
) {
  if (configured) return withClerk(request, event);
  return isPublicPage(request)
    ? withContentPolicy(request)
    : signInRequired(request);
}
export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|map)).*)",
    "/(api|trpc)(.*)",
    "/__clerk/:path*",
  ],
};
