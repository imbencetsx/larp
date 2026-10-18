import { clerkMiddleware } from "@clerk/nextjs/server";
import {
  NextResponse,
  type NextRequest,
  type NextFetchEvent,
} from "next/server";
import { signGuest, verifyGuest } from "~/lib/guest-session";
import { contentPolicy } from "~/lib/content-policy";
const configured = Boolean(
  process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY && process.env.CLERK_SECRET_KEY,
);
async function guestSession(request: NextRequest) {
  const original = request.cookies.get("larp_guest")?.value;
  const guest = await verifyGuest(original);
  const token = guest ? original! : await signGuest(crypto.randomUUID());
  request.cookies.set("larp_guest", token);
  const nonce = btoa(
    String.fromCharCode(...crypto.getRandomValues(new Uint8Array(16))),
  );
  const policy = contentPolicy(nonce);
  request.headers.set("x-nonce", nonce);
  request.headers.set("Content-Security-Policy", policy);
  const response = NextResponse.next({ request: { headers: request.headers } });
  response.headers.set("Content-Security-Policy", policy);
  if (!guest)
    response.cookies.set("larp_guest", token, {
      httpOnly: true,
      sameSite: "lax",
      secure: request.nextUrl.protocol === "https:",
      path: "/",
      maxAge: 60 * 60 * 24 * 365,
    });
  return response;
}
const withClerk = clerkMiddleware((_auth, request) => guestSession(request));
export default function middleware(
  request: NextRequest,
  event: NextFetchEvent,
) {
  return configured ? withClerk(request, event) : guestSession(request);
}
export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|map)).*)",
    "/(api|trpc)(.*)",
    "/__clerk/:path*",
  ],
};
