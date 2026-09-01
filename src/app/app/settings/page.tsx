"use client";

import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { ErrorMessage } from "@/components/ui/ErrorMessage";
import { Input } from "@/components/ui/Input";
import { LoadingState } from "@/components/ui/LoadingState";
import { useAuth } from "@/hooks/useAuth";
import { userService } from "@/services/user.service";
import { queryKeys } from "@/lib/query-keys";

const profileSchema = z.object({
  name: z.string().min(2, "Informe seu nome."),
  email: z.email(),
});

const passwordSchema = z
  .object({
    current_password: z.string().min(8, "Informe sua senha atual."),
    new_password: z.string().min(8, "A nova senha precisa ter ao menos 8 caracteres."),
    new_password_confirmation: z.string().min(8, "Confirme a nova senha."),
  })
  .refine((values) => values.new_password === values.new_password_confirmation, {
    path: ["new_password_confirmation"],
    message: "A confirmacao precisa ser igual a nova senha.",
  });

type ProfileFormValues = z.infer<typeof profileSchema>;
type PasswordFormValues = z.infer<typeof passwordSchema>;

export default function SettingsPage() {
  const { setUser, user: authenticatedUser } = useAuth();
  const [successMessage, setSuccessMessage] = useState("");
  const profileForm = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: "",
      email: "",
    },
  });
  const passwordForm = useForm<PasswordFormValues>({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      current_password: "",
      new_password: "",
      new_password_confirmation: "",
    },
  });

  const userQuery = useQuery({
    queryKey: queryKeys.currentUser,
    queryFn: userService.getMe,
    initialData: authenticatedUser ?? undefined,
    staleTime: 5 * 60_000,
  });

  useEffect(() => {
    if (userQuery.data) {
      profileForm.reset({
        name: userQuery.data.name,
        email: userQuery.data.email,
      });
    }
  }, [profileForm, userQuery.data]);

  async function submitProfile(values: ProfileFormValues) {
    const user = await userService.updateProfile({ name: values.name });
    setUser(user);
    setSuccessMessage("Nome atualizado com sucesso.");
  }

  async function submitPassword(values: PasswordFormValues) {
    await userService.updatePassword(values);
    passwordForm.reset();
    setSuccessMessage("Senha atualizada com sucesso.");
  }

  return (
    <div className="space-y-6">
      <Card>
        <p className="text-sm font-semibold uppercase tracking-[0.28em] text-[var(--color-primary)]">
          Configuracoes
        </p>
        <h1 className="mt-3 font-display text-3xl font-semibold text-slate-950">
          Ajuste seus dados de acesso
        </h1>
        <p className="mt-2 text-sm text-slate-500">
          Atualize seu nome e troque a senha sem expor informacoes sensiveis no frontend.
        </p>
      </Card>

      {successMessage ? (
        <div className="rounded-[10px] border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          {successMessage}
        </div>
      ) : null}
      {userQuery.error ? <ErrorMessage message={userQuery.error.message || "Erro ao carregar configuracoes."} /> : null}
      {userQuery.isPending ? <LoadingState label="Carregando configuracoes..." /> : null}

      {!userQuery.isPending ? (
        <div className="grid gap-6 xl:grid-cols-2">
          <Card>
            <h2 className="font-display text-xl font-semibold text-slate-950">Perfil</h2>
            <form className="mt-5 space-y-4" onSubmit={profileForm.handleSubmit((values) => void submitProfile(values))}>
              <Input label="Nome" error={profileForm.formState.errors.name?.message} {...profileForm.register("name")} />
              <Input label="E-mail" disabled error={profileForm.formState.errors.email?.message} {...profileForm.register("email")} />
              <Button type="submit" disabled={profileForm.formState.isSubmitting}>
                {profileForm.formState.isSubmitting ? "Salvando..." : "Salvar perfil"}
              </Button>
            </form>
          </Card>

          <Card>
            <h2 className="font-display text-xl font-semibold text-slate-950">Alterar senha</h2>
            <form className="mt-5 space-y-4" onSubmit={passwordForm.handleSubmit((values) => void submitPassword(values))}>
              <Input
                label="Senha atual"
                type="password"
                error={passwordForm.formState.errors.current_password?.message}
                {...passwordForm.register("current_password")}
              />
              <Input
                label="Nova senha"
                type="password"
                error={passwordForm.formState.errors.new_password?.message}
                {...passwordForm.register("new_password")}
              />
              <Input
                label="Confirmar nova senha"
                type="password"
                error={passwordForm.formState.errors.new_password_confirmation?.message}
                {...passwordForm.register("new_password_confirmation")}
              />
              <Button type="submit" disabled={passwordForm.formState.isSubmitting}>
                {passwordForm.formState.isSubmitting ? "Salvando..." : "Atualizar senha"}
              </Button>
            </form>
          </Card>
        </div>
      ) : null}
    </div>
  );
}
