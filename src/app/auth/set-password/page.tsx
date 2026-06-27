"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Button } from "@/components/ui/Button";
import { ErrorMessage } from "@/components/ui/ErrorMessage";
import { Input } from "@/components/ui/Input";
import { LoadingState } from "@/components/ui/LoadingState";
import { authService } from "@/services/auth.service";

const setPasswordSchema = z
  .object({
    password: z.string().min(8, "A senha precisa ter pelo menos 8 caracteres."),
    password_confirmation: z.string().min(8, "Confirme sua senha."),
  })
  .refine((values) => values.password === values.password_confirmation, {
    path: ["password_confirmation"],
    message: "As senhas precisam ser iguais.",
  });

type SetPasswordFormValues = z.infer<typeof setPasswordSchema>;

function SetPasswordContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token") ?? "";
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SetPasswordFormValues>({
    resolver: zodResolver(setPasswordSchema),
    defaultValues: {
      password: "",
      password_confirmation: "",
    },
  });

  async function submit(values: SetPasswordFormValues) {
    setErrorMessage("");
    setSuccessMessage("");

    if (!token) {
      setErrorMessage("O token para criar a senha nao foi informado.");
      return;
    }

    try {
      await authService.setPassword({
        token,
        password: values.password,
        password_confirmation: values.password_confirmation,
      });
      setSuccessMessage("Senha criada com sucesso. Voce sera redirecionado para o login.");
      setTimeout(() => router.replace("/auth/login"), 1200);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Nao foi possivel salvar a senha.");
    }
  }

  return (
    <div className="mx-auto max-w-md">
      <p className="text-sm font-semibold uppercase tracking-[0.28em] text-[var(--color-primary)]">
        Criar senha
      </p>
      <h1 className="mt-4 font-display text-3xl font-semibold text-slate-950">
        Finalize seu acesso
      </h1>
      <p className="mt-3 text-sm leading-6 text-slate-500">
        Defina uma senha forte para entrar no app sempre que precisar revisar seu mes.
      </p>

      <form className="mt-8 space-y-4" onSubmit={handleSubmit(submit)}>
        <Input
          label="Senha"
          type="password"
          autoComplete="new-password"
          error={errors.password?.message}
          {...register("password")}
        />
        <Input
          label="Confirmar senha"
          type="password"
          autoComplete="new-password"
          error={errors.password_confirmation?.message}
          {...register("password_confirmation")}
        />
        {errorMessage ? <ErrorMessage message={errorMessage} /> : null}
        {successMessage ? (
          <div className="rounded-[10px] border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
            {successMessage}
          </div>
        ) : null}
        <Button className="w-full" type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Salvando..." : "Salvar senha"}
        </Button>
      </form>
    </div>
  );
}

export default function SetPasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="mx-auto max-w-md">
          <LoadingState label="Preparando formulario..." />
        </div>
      }
    >
      <SetPasswordContent />
    </Suspense>
  );
}
