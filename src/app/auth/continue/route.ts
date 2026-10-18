import { NextResponse, type NextRequest } from "next/server";
import { authContinuation, learningDestination } from "~/lib/onboarding";
import { getClerkUserId } from "~/server/auth";
import { getLearnerProfile } from "~/server/services/onboarding";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const next = learningDestination(request.nextUrl.searchParams.get("next"));
  const userId = await getClerkUserId();
  let destination: string;
  if (!userId) {
    destination = `/sign-in?redirect_url=${encodeURIComponent(authContinuation(next))}`;
  } else {
    const profile = await getLearnerProfile(userId);
    destination = profile.onboardingCompletedAt
      ? next
      : `/onboarding?next=${encodeURIComponent(next)}`;
  }

  // This endpoint only hands off navigation. An HTTP redirect avoids streaming
  // a redirect-only React document and waiting for its client router to run.
  const response = NextResponse.redirect(new URL(destination, request.url));
  response.headers.set("Cache-Control", "no-store");
  return response;
}
