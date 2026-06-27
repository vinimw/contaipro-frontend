"use client";

import Link from "next/link";
import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Button } from "@/components/ui/Button";
import { ErrorMessage } from "@/components/ui/ErrorMessage";
import { Input } from "@/components/ui/Input";
import { PhoneInput } from "@/components/ui/PhoneInput";
import { isValidPhone, normalizePhoneDigits } from "@/lib/phone";
import { authService } from "@/services/auth.service";

const registerSchema = z.object({
  name: z.string().min(2, "Informe seu nome."),
  email: z.email("Use um e-mail valido."),
  phone: z.string().refine(isValidPhone, "Informe um telefone valido."),
});

type RegisterFormValues = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const {
    control,
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
    },
  });
  const [message, setMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  async function submit(values: RegisterFormValues) {
    setErrorMessage("");
    setMessage("");

    try {
      await authService.register({
        ...values,
        phone: normalizePhoneDigits(values.phone),
      });
      reset();
      setMessage("Enviamos um e-mail de confirmacao para voce continuar seu cadastro.");
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Nao foi possivel concluir o cadastro.");
    }
  }

  return (
    <div className="mx-auto max-w-md">
      <p className="text-sm font-semibold uppercase tracking-[0.28em] text-[var(--color-primary)]">
        Cadastro
      </p>
      <h1 className="mt-4 font-display text-3xl font-semibold text-slate-950">
        Crie sua conta financeira
      </h1>
      <p className="mt-3 text-sm leading-6 text-slate-500">
        Comece com seu nome, e-mail e telefone. O restante do fluxo segue pelo link de
        confirmacao.
      </p>

      <form className="mt-8 space-y-4" onSubmit={handleSubmit(submit)}>
        <Input label="Nome" error={errors.name?.message} {...register("name")} />
        <Input
          label="E-mail"
          type="email"
          autoComplete="email"
          error={errors.email?.message}
          {...register("email")}
        />
        <PhoneInput
          control={control}
          label="Telefone"
          error={errors.phone?.message}
          name="phone"
        />
        {errorMessage ? <ErrorMessage message={errorMessage} /> : null}
        {message ? (
          <div className="rounded-[10px] border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
            {message}
          </div>
        ) : null}
        <Button className="w-full" type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Enviando..." : "Criar cadastro"}
        </Button>
      </form>

      <p className="mt-6 text-sm text-slate-500">
        Ja tem acesso?{" "}
        <Link className="font-semibold text-[var(--color-primary)]" href="/auth/login">
          Fazer login
        </Link>
      </p>
    </div>
  );
}
