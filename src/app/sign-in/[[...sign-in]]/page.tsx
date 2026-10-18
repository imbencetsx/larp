import { AuthScreen } from "~/components/larp/auth-screen";
export const metadata = { title: "Sign in" };
export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ redirect_url?: string }>;
}) {
  return (
    <AuthScreen
      mode="sign-in"
      destination={(await searchParams).redirect_url}
    />
  );
}
