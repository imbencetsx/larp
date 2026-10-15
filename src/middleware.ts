import { clerkMiddleware } from "@clerk/nextjs/server";
import {
  NextResponse,
  type NextRequest,
  type NextFetchEvent,
} from "next/server";
const configured = Boolean(
  process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY && process.env.CLERK_SECRET_KEY,
);
function guestSession(request: NextRequest) {
  let guest = request.cookies.get("larp_guest")?.value;
  if (!guest || !/^[0-9a-f-]{36}$/.test(guest)) guest = crypto.randomUUID();
  request.cookies.set("larp_guest", guest);
  const response = NextResponse.next({ request: { headers: request.headers } });
  response.cookies.set("larp_guest", guest, {
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
  ],
};
