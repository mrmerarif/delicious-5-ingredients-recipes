import AuthPage, { type AuthPageProps } from "@/components/auth/AuthPage";

export default function LoginPage(props: AuthPageProps) {
  return <AuthPage mode="login" {...props} />;
}
