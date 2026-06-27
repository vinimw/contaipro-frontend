"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

import { LoadingState } from "@/components/ui/LoadingState";
import { getAccessToken } from "@/lib/auth";

export default function HomePage() {
  const router = useRouter();

  useEffect(() => {
    router.replace(getAccessToken() ? "/app/dashboard" : "/auth/login");
  }, [router]);

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-md items-center px-4">
      <LoadingState label="Redirecionando..." />
    </main>
  );
}
