"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Button } from "@/components/ui/Button";
import { ErrorMessage } from "@/components/ui/ErrorMessage";
import { Input } from "@/components/ui/Input";
import { useAuth } from "@/hooks/useAuth";

const loginSchema = z.object({
  email: z.email("Use um e-mail valido."),
  password: z.string().min(8, "A senha precisa ter pelo menos 8 caracteres."),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const { isAuthenticated, login } = useAuth();
  const [errorMessage, setErrorMessage] = useState("");
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  useEffect(() => {
    if (isAuthenticated) {
      router.replace("/app/dashboard");
    }
  }, [isAuthenticated, router]);

  async function submit(values: LoginFormValues) {
    setErrorMessage("");

    try {
      await login(values);
      router.replace("/app/dashboard");
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Nao foi possivel entrar.");
    }
  }

  return (
    <div className="mx-auto max-w-md">
      <p className="text-sm font-semibold uppercase tracking-[0.28em] text-[var(--color-primary)]">
        Login
      </p>
      <h1 className="mt-4 font-display text-3xl font-semibold text-slate-950">
        Entre para ver seu mes financeiro
      </h1>
      <p className="mt-3 text-sm leading-6 text-slate-500">
        Acesse seu painel para acompanhar contas, gastos rapidos e saldo previsto.
      </p>

      <form className="mt-8 space-y-4" onSubmit={handleSubmit(submit)}>
        <Input
          label="E-mail"
          type="email"
          autoComplete="email"
          error={errors.email?.message}
          {...register("email")}
        />
        <Input
          label="Senha"
          type="password"
          autoComplete="current-password"
          error={errors.password?.message}
          {...register("password")}
        />
        {errorMessage ? <ErrorMessage message={errorMessage} /> : null}
        <Button className="w-full" type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Entrando..." : "Entrar"}
        </Button>
      </form>

      <div className="mt-6 flex flex-col gap-2 text-sm text-slate-500">
        <Link className="font-semibold text-[var(--color-primary)]" href="/auth/register">
          Ainda nao tenho cadastro
        </Link>
      </div>
    </div>
  );
}
