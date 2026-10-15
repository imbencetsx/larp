import "~/styles/globals.css";
import { type Metadata } from "next";
import { Geist_Mono, Tiny5, Pixelify_Sans } from "next/font/google";
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
            signInUrl="/sign-in"
            signUpUrl="/sign-up"
            appearance={{
              elements: { formButtonPrimary: { color: "#1a2314" } },
              variables: {
                colorPrimary: "#bedb8a",
                colorBackground: "#1c1916",
                colorInputBackground: "#141210",
                colorText: "#efe9de",
                colorTextSecondary: "#aaa193",
                fontFamily: "var(--font-pixel), monospace",
                borderRadius: "var(--radius)",
              },
            }}
            signInFallbackRedirectUrl="/"
            signUpFallbackRedirectUrl="/"
          >
            {content}
          </ClerkProvider>
        ) : (
          content
        )}
      </body>
    </html>
  );
}
