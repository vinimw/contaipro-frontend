import { redirect } from "next/navigation";

// The private layout sends unauthenticated users to /auth/login.
export default function HomePage() {
  redirect("/app/dashboard");
}
