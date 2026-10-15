import { AuthScreen } from "~/components/larp/auth-screen";
export const metadata = { title: "Sign in" };
export default function Page() {
  return <AuthScreen mode="sign-in" />;
}
