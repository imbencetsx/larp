import { AuthScreen } from "~/components/larp/auth-screen";
export const metadata = { title: "Create an account" };
export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ redirect_url?: string }>;
}) {
  return (
    <AuthScreen
      mode="sign-up"
      destination={(await searchParams).redirect_url}
    />
  );
}
