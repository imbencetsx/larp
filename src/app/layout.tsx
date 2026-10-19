import "~/styles/globals.css";
import { type Metadata } from "next";
import { Geist_Mono, Tiny5, Pixelify_Sans } from "next/font/google";
import { AnalyticsProvider } from "~/components/larp/analytics-provider";
import { ClerkProvider } from "@clerk/nextjs";
import { TRPCReactProvider } from "~/trpc/react";
const mono = Geist_Mono({ subsets: ["latin"], variable: "--font-code" });
const tiny = Tiny5({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-tiny",
});
const pixel = Pixelify_Sans({ subsets: ["latin"], variable: "--font-pixel" });
export const metadata: Metadata = {
  title: { default: "LARP — Learn. Build. Repeat.", template: "%s · LARP" },
  description:
    "Learn HTML, CSS, JavaScript, TypeScript, and Next.js through small lessons, hands-on practice, and a garden that grows with you.",
  icons: [{ rel: "icon", url: "/icon.svg" }],
};
export const dynamic = "force-dynamic";
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const configured = Boolean(
    process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY &&
    process.env.CLERK_SECRET_KEY,
  );
  const content = <TRPCReactProvider>{children}</TRPCReactProvider>;
  return (
    <html
      lang="en"
      className={`dark ${mono.variable} ${tiny.variable} ${pixel.variable}`}
    >
      <body>
        {configured ? (
          <ClerkProvider
            dynamic
            signInUrl="/sign-in"
            signUpUrl="/sign-up"
            appearance={{
              elements: {
                badge: {
                  '&[data-color="primary"]': {
                    color: "#eeeeee",
                    backgroundColor: "#303030",
                    borderColor: "#414141",
                  },
                },
                activeDeviceIcon: {
                  "--cl-chassis-bottom": "#a8a8a8",
                  "--cl-chassis-back": "#a8a8a8",
                  "--cl-chassis-screen": "#eeeeee",
                  "--cl-screen": "#303030",
                },
              },
              variables: {
                colorPrimary: "#bedb8a",
                colorPrimaryForeground: "#1a2314",
                colorBackground: "#1a1a1a",
                // Menu actions and icons use neutral shades, separate from text.
                colorNeutral: "#eeeeee",
                colorForeground: "#eeeeee",
                colorMutedForeground: "#a8a8a8",
                colorMuted: "#242424",
                colorInput: "#121212",
                colorInputForeground: "#eeeeee",
                colorBorder: "#414141",
                colorModalBackdrop: "rgba(0, 0, 0, 0.15)",
                colorDanger: "#ed867e",
                colorSuccess: "#9cd675",
                colorWarning: "#ddbc74",
                fontFamily: "var(--font-pixel), monospace",
                borderRadius: "var(--radius)",
              },
            }}
            signInFallbackRedirectUrl="/auth/continue"
            signUpFallbackRedirectUrl="/auth/continue"
          >
            <AnalyticsProvider />
            {content}
          </ClerkProvider>
        ) : (
          content
        )}
      </body>
    </html>
  );
}
