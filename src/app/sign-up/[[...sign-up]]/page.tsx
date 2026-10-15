import { AuthScreen } from "~/components/larp/auth-screen";
export const metadata = { title: "Create an account" };
export default function Page() {
  return <AuthScreen mode="sign-up" />;
}
