"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import { Button } from "@/components/ui/Button";
import { ErrorMessage } from "@/components/ui/ErrorMessage";
import { LoadingState } from "@/components/ui/LoadingState";
import { authService } from "@/services/auth.service";

function ConfirmEmailContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const [status, setStatus] = useState<"loading" | "error" | "success">("loading");
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    async function confirm() {
      if (!token) {
        setStatus("error");
        setErrorMessage("O token de confirmacao nao foi informado.");
        return;
      }

      try {
        await authService.confirmEmail(token);
        setStatus("success");
        router.replace(`/auth/set-password?token=${encodeURIComponent(token)}`);
      } catch (error) {
        setStatus("error");
        setErrorMessage(
          error instanceof Error ? error.message : "Nao foi possivel confirmar seu e-mail.",
        );
      }
    }

    void confirm();
  }, [router, token]);

  if (status === "loading") {
    return (
      <div className="mx-auto max-w-md">
        <LoadingState label="Confirmando seu e-mail..." />
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="mx-auto max-w-md space-y-4">
        <h1 className="font-display text-3xl font-semibold text-slate-950">
          Nao conseguimos validar seu link
        </h1>
        <ErrorMessage message={errorMessage} />
        <Button className="w-full" onClick={() => router.push("/auth/login")}>
          Voltar para login
        </Button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-md">
      <LoadingState label="E-mail confirmado. Redirecionando para criacao de senha..." />
    </div>
  );
}

export default function ConfirmEmailPage() {
  return (
    <Suspense
      fallback={
        <div className="mx-auto max-w-md">
          <LoadingState label="Preparando confirmacao..." />
        </div>
      }
    >
      <ConfirmEmailContent />
    </Suspense>
  );
}
