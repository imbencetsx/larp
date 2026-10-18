"use client";
import { useAuth } from "@clerk/nextjs";
import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { identifyLearner, trackEvent } from "~/lib/analytics";

export function AnalyticsProvider() {
  const { isLoaded, userId } = useAuth();
  const pathname = usePathname();
  useEffect(() => {
    if (isLoaded) identifyLearner(userId ?? null);
  }, [isLoaded, userId]);
  useEffect(() => {
    if (
      isLoaded &&
      userId &&
      !/^\/(sign-in|sign-up|auth)(\/|$)/.test(pathname)
    ) {
      identifyLearner(userId);
      trackEvent("learning_page_viewed", { path: pathname });
    }
  }, [isLoaded, userId, pathname]);
  return null;
}
