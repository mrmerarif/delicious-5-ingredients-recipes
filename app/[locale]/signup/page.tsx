import AuthPage, { type AuthPageProps } from "@/components/auth/AuthPage";

export default function SignupPage(props: AuthPageProps) {
  return <AuthPage mode="signup" {...props} />;
}
