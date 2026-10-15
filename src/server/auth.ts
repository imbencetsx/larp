import { auth } from "@clerk/nextjs/server";
export const authConfigured = Boolean(
  process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY && process.env.CLERK_SECRET_KEY,
);
export async function getClerkUserId() {
  return authConfigured ? (await auth()).userId : null;
}
