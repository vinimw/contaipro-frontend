"use client";

import { useCallback, useEffect, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Pencil, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { CurrencyInput } from "@/components/ui/CurrencyInput";
import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorMessage } from "@/components/ui/ErrorMessage";
import { Input } from "@/components/ui/Input";
import { LoadingState } from "@/components/ui/LoadingState";
import { formatCurrencyBRL } from "@/lib/currency";
import { formatDateBR, formatMonthLabel, getCurrentMonth } from "@/lib/dates";
import { extraIncomesService } from "@/services/extra-incomes.service";
import { financialProfileService } from "@/services/financial-profile.service";
import type { ExtraIncome } from "@/types/extra-income";
import type {
  FinancialProfileOverview,
  FinancialProfilePeriod,
} from "@/types/financial-profile";

const profileSchema = z.object({
  monthly_income_amount: z.coerce.number().min(0, "Informe um valor valido."),
  start_month: z
    .string()
    .regex(/^\d{4}-\d{2}$/, "Informe o mês de início da vigência."),
});

const extraIncomeSchema = z.object({
  name: z.string().min(2, "Informe um nome."),
  amount: z.coerce.number().positive("Informe um valor maior que zero."),
  income_date: z.string().optional(),
});

type ProfileFormValues = z.infer<typeof profileSchema>;
type ExtraIncomeFormValues = z.infer<typeof extraIncomeSchema>;
type ProfileFormInput = z.input<typeof profileSchema>;
type ExtraIncomeFormInput = z.input<typeof extraIncomeSchema>;

export default function IncomePage() {
  const currentMonth = getCurrentMonth();
  const [items, setItems] = useState<ExtraIncome[]>([]);
  const [profileOverview, setProfileOverview] =
    useState<FinancialProfileOverview | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [editingProfilePeriod, setEditingProfilePeriod] =
    useState<FinancialProfilePeriod | null>(null);
  const [profilePeriodToDelete, setProfilePeriodToDelete] =
    useState<FinancialProfilePeriod | null>(null);
  const [editingIncome, setEditingIncome] = useState<ExtraIncome | null>(null);
  const [incomeToDelete, setIncomeToDelete] = useState<ExtraIncome | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isDeletingProfilePeriod, setIsDeletingProfilePeriod] = useState(false);
  const profileForm = useForm<ProfileFormInput, unknown, ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      monthly_income_amount: 0,
      start_month: currentMonth,
    },
  });
  const extraIncomeForm = useForm<ExtraIncomeFormInput, unknown, ExtraIncomeFormValues>({
    resolver: zodResolver(extraIncomeSchema),
    defaultValues: {
      name: "",
      amount: 0,
      income_date: "",
    },
  });

  const loadData = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage("");

    try {
      const [profile, extraIncomes] = await Promise.all([
        financialProfileService.get(),
        extraIncomesService.list(currentMonth),
      ]);

      setProfileOverview(profile);
      profileForm.reset({
        monthly_income_amount:
          profile.current_profile?.monthly_income_amount ?? 0,
        start_month: currentMonth,
      });
      setItems(extraIncomes);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Erro ao carregar renda.");
    } finally {
      setIsLoading(false);
    }
  }, [currentMonth, profileForm]);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      void loadData();
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, [loadData]);

  async function submitProfile(values: ProfileFormValues) {
    setSuccessMessage("");
    setErrorMessage("");

    try {
      const profile = editingProfilePeriod
        ? await financialProfileService.updatePeriod(editingProfilePeriod.id, values)
        : await financialProfileService.update(values);
      setProfileOverview(profile);
      setEditingProfilePeriod(null);
      profileForm.reset({
        monthly_income_amount:
          profile.current_profile?.monthly_income_amount ??
          values.monthly_income_amount,
        start_month: currentMonth,
      });
      setSuccessMessage(
        editingProfilePeriod
          ? "Período de renda atualizado."
          : "Renda mensal atualizada.",
      );
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Nao foi possivel atualizar a renda mensal.",
      );
    }
  }

  async function handleProfilePeriodDelete() {
    if (!profilePeriodToDelete) {
      return;
    }

    setErrorMessage("");
    setSuccessMessage("");
    setIsDeletingProfilePeriod(true);

    try {
      const profile = await financialProfileService.removePeriod(
        profilePeriodToDelete.id,
      );
      setProfileOverview(profile);

      if (editingProfilePeriod?.id === profilePeriodToDelete.id) {
        setEditingProfilePeriod(null);
        profileForm.reset({
          monthly_income_amount: profile.current_profile?.monthly_income_amount ?? 0,
          start_month: currentMonth,
        });
      }

      setProfilePeriodToDelete(null);
      setSuccessMessage("Período de renda removido.");
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Nao foi possivel remover o período de renda.",
      );
    } finally {
      setIsDeletingProfilePeriod(false);
    }
  }

  async function submitExtraIncome(values: ExtraIncomeFormValues) {
    setSuccessMessage("");

    if (editingIncome) {
      await extraIncomesService.update(editingIncome.id, {
        name: values.name,
        amount: values.amount,
        income_date: values.income_date || null,
      });
      setSuccessMessage("Renda extra atualizada.");
    } else {
      await extraIncomesService.create({
        name: values.name,
        amount: values.amount,
        income_date: values.income_date || null,
      });
      setSuccessMessage("Renda extra criada.");
    }

    extraIncomeForm.reset({
      name: "",
      amount: 0,
      income_date: "",
    });
    setEditingIncome(null);
    await loadData();
  }

  async function handleDelete() {
    if (!incomeToDelete) {
      return;
    }

    setErrorMessage("");
    setSuccessMessage("");
    setIsDeleting(true);

    try {
      await extraIncomesService.remove(incomeToDelete.id);

      if (editingIncome?.id === incomeToDelete.id) {
        setEditingIncome(null);
        extraIncomeForm.reset({
          name: "",
          amount: 0,
          income_date: "",
        });
      }

      setIncomeToDelete(null);
      setSuccessMessage("Renda extra removida.");
      await loadData();
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Nao foi possivel remover a renda extra.");
    } finally {
      setIsDeleting(false);
    }
  }

  const currentProfile = profileOverview?.current_profile ?? null;
  const profileHistory = profileOverview?.history ?? [];

  return (
    <div className="space-y-6">
      <Card>
        <p className="text-sm font-semibold uppercase tracking-[0.28em] text-[var(--color-primary)]">
          Renda
        </p>
        <h1 className="mt-3 font-display text-2xl font-semibold text-slate-950">
          Perfil financeiro e entradas extras
        </h1>
        <p className="mt-2 text-sm text-slate-500">
          Atualize sua renda fixa e registre valores extras que entram ao longo do mes.
        </p>
      </Card>

      {successMessage ? (
        <div className="rounded-[10px] border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          {successMessage}
        </div>
      ) : null}
      {errorMessage ? <ErrorMessage message={errorMessage} /> : null}
      {isLoading ? <LoadingState label="Carregando dados de renda..." /> : null}

      {!isLoading ? (
        <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
          <Card>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--color-primary-strong)]">
              Vigência mensal
            </p>
            <h2 className="mt-2 font-display text-xl font-semibold text-slate-950">
              Renda mensal
            </h2>
            <div className="mt-5 rounded-[10px] bg-slate-50 p-4">
              <p className="text-sm text-slate-500">Renda vigente</p>
              <p className="mt-2 text-3xl font-extrabold tracking-[-0.04em] text-slate-950">
                {formatCurrencyBRL(currentProfile?.monthly_income_amount ?? 0)}
              </p>
              <p className="mt-2 text-sm text-slate-500">
                {currentProfile
                  ? `Desde ${formatMonthLabel(currentProfile.start_month)}`
                  : "Nenhuma renda mensal cadastrada ainda."}
              </p>
            </div>

            <form className="mt-5 space-y-4" onSubmit={profileForm.handleSubmit((values) => void submitProfile(values))}>
              {editingProfilePeriod ? (
                <div className="rounded-[10px] border border-[var(--color-primary)] bg-[var(--color-primary-soft)] px-4 py-3 text-sm font-medium text-[#071a3d]">
                  Editando o período iniciado em{" "}
                  {formatMonthLabel(editingProfilePeriod.start_month)}.
                </div>
              ) : null}
              <CurrencyInput
                control={profileForm.control}
                label={
                  editingProfilePeriod
                    ? "Valor do período"
                    : "Novo valor da renda mensal"
                }
                error={profileForm.formState.errors.monthly_income_amount?.message}
                name="monthly_income_amount"
              />
              <Input
                label="Mês de início"
                type="month"
                error={profileForm.formState.errors.start_month?.message}
                {...profileForm.register("start_month")}
              />
              <p className="text-xs leading-5 text-slate-500">
                Ao salvar, a renda anterior é encerrada automaticamente no mês anterior
                ao início desta nova vigência. Para indicar que ficou sem renda, salve
                uma nova vigência com valor zero.
              </p>
              <div className="flex flex-wrap gap-3">
                <Button type="submit" disabled={profileForm.formState.isSubmitting}>
                  {profileForm.formState.isSubmitting
                    ? "Salvando..."
                    : editingProfilePeriod
                      ? "Salvar período"
                      : "Atualizar renda"}
                </Button>
                {editingProfilePeriod ? (
                  <Button
                    variant="ghost"
                    onClick={() => {
                      setEditingProfilePeriod(null);
                      profileForm.reset({
                        monthly_income_amount:
                          currentProfile?.monthly_income_amount ?? 0,
                        start_month: currentMonth,
                      });
                    }}
                  >
                    Cancelar edição
                  </Button>
                ) : null}
              </div>
            </form>

            <div className="mt-6 space-y-3">
              <h3 className="text-sm font-bold uppercase tracking-[0.16em] text-slate-500">
                Histórico
              </h3>
              {profileHistory.length ? (
                profileHistory.map((period) => (
                  <div
                    key={period.id}
                    className="flex flex-col gap-4 rounded-[10px] border border-slate-100 bg-white p-4 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div>
                      <p className="font-semibold text-slate-950">
                        {formatCurrencyBRL(period.monthly_income_amount)}
                      </p>
                      <p className="mt-1 text-sm text-slate-500">
                        {formatMonthLabel(period.start_month)} ate{" "}
                        {period.end_month
                          ? formatMonthLabel(period.end_month)
                          : "vigente"}
                      </p>
                    </div>
                    <div className="flex shrink-0 items-center gap-2">
                      {!period.end_month ? (
                        <span className="rounded-[10px] bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700">
                          Atual
                        </span>
                      ) : null}
                      <span className="group relative inline-flex">
                        <Button
                          aria-label={`Editar período iniciado em ${formatMonthLabel(period.start_month)}`}
                          className="size-10 min-h-0 rounded-[10px] p-0 shadow-none"
                          title="Editar período"
                          variant="secondary"
                          onClick={() => {
                            setEditingProfilePeriod(period);
                            setSuccessMessage("");
                            setErrorMessage("");
                            profileForm.reset({
                              monthly_income_amount: period.monthly_income_amount,
                              start_month: period.start_month,
                            });
                          }}
                        >
                          <Pencil className="size-4" />
                        </Button>
                        <span className="pointer-events-none absolute bottom-full left-1/2 z-20 mb-2 -translate-x-1/2 whitespace-nowrap rounded-[10px] bg-slate-950 px-2.5 py-1 text-[11px] font-semibold text-white opacity-0 shadow-lg transition group-hover:opacity-100 group-focus-within:opacity-100">
                          Editar período
                        </span>
                      </span>
                      <span className="group relative inline-flex">
                        <Button
                          aria-label={`Excluir período iniciado em ${formatMonthLabel(period.start_month)}`}
                          className="size-10 min-h-0 rounded-[10px] p-0 shadow-none"
                          title="Excluir período"
                          variant="danger"
                          onClick={() => setProfilePeriodToDelete(period)}
                        >
                          <Trash2 className="size-4" />
                        </Button>
                        <span className="pointer-events-none absolute bottom-full left-1/2 z-20 mb-2 -translate-x-1/2 whitespace-nowrap rounded-[10px] bg-slate-950 px-2.5 py-1 text-[11px] font-semibold text-white opacity-0 shadow-lg transition group-hover:opacity-100 group-focus-within:opacity-100">
                          Excluir período
                        </span>
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <EmptyState
                  title="Nenhuma vigência cadastrada"
                  description="Cadastre uma renda mensal informando o mês em que ela começou."
                />
              )}
            </div>
          </Card>

          <Card>
            <div className="flex items-center justify-between gap-4">
              <div>
                <h2 className="font-display text-xl font-semibold text-slate-950">Renda extra</h2>
                <p className="mt-1 text-sm text-slate-500">
                  Adicione entradas ocasionais para o mes atual.
                </p>
              </div>
            </div>
            <form
              className="mt-5 space-y-4"
              onSubmit={extraIncomeForm.handleSubmit((values) => void submitExtraIncome(values))}
            >
              <Input label="Nome" error={extraIncomeForm.formState.errors.name?.message} {...extraIncomeForm.register("name")} />
              <div className="grid gap-4 sm:grid-cols-2">
                <CurrencyInput
                  control={extraIncomeForm.control}
                  label="Valor"
                  error={extraIncomeForm.formState.errors.amount?.message}
                  name="amount"
                />
                <Input
                  label="Data"
                  type="date"
                  error={extraIncomeForm.formState.errors.income_date?.message}
                  {...extraIncomeForm.register("income_date")}
                />
              </div>
              <div className="flex flex-wrap gap-3">
                <Button type="submit" disabled={extraIncomeForm.formState.isSubmitting}>
                  {extraIncomeForm.formState.isSubmitting
                    ? "Salvando..."
                    : editingIncome
                      ? "Salvar alteracoes"
                      : "Adicionar renda"}
                </Button>
                {editingIncome ? (
                  <Button
                    variant="ghost"
                    onClick={() => {
                      setEditingIncome(null);
                      extraIncomeForm.reset({
                        name: "",
                        amount: 0,
                        income_date: "",
                      });
                    }}
                  >
                    Cancelar edicao
                  </Button>
                ) : null}
              </div>
            </form>

            <div className="mt-6 space-y-3">
              {items.length ? (
                items.map((item) => (
                  <div key={item.id} className="flex flex-col gap-3 rounded-[10px] bg-slate-50 p-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="font-medium text-slate-900">{item.name}</p>
                      <p className="text-sm text-slate-500">
                        {formatDateBR(item.income_date ?? item.created_at ?? "")}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-slate-950">
                        {formatCurrencyBRL(item.amount)}
                      </span>
                      <Button
                        variant="secondary"
                        onClick={() => {
                          setEditingIncome(item);
                          extraIncomeForm.reset({
                            name: item.name,
                            amount: item.amount,
                            income_date: item.income_date?.slice(0, 10) ?? "",
                          });
                        }}
                      >
                        <Pencil className="mr-2 size-4" />
                        Editar
                      </Button>
                      <Button variant="danger" onClick={() => setIncomeToDelete(item)}>
                        <Trash2 className="mr-2 size-4" />
                        Excluir
                      </Button>
                    </div>
                  </div>
                ))
              ) : (
                <EmptyState
                  title="Nenhuma renda extra encontrada"
                  description="Quando houver uma entrada adicional, ela aparecera aqui."
                />
              )}
            </div>
          </Card>
        </div>
      ) : null}
      <ConfirmDialog
        description={
          profilePeriodToDelete
            ? `O período de ${formatMonthLabel(profilePeriodToDelete.start_month)} será removido do histórico de renda. Essa ação não pode ser desfeita.`
            : ""
        }
        isLoading={isDeletingProfilePeriod}
        open={Boolean(profilePeriodToDelete)}
        title="Excluir período de renda?"
        onCancel={() => {
          if (!isDeletingProfilePeriod) {
            setProfilePeriodToDelete(null);
          }
        }}
        onConfirm={() => void handleProfilePeriodDelete()}
      />
      <ConfirmDialog
        description={
          incomeToDelete
            ? `A renda extra "${incomeToDelete.name}" será removida. Essa ação não pode ser desfeita.`
            : ""
        }
        isLoading={isDeleting}
        open={Boolean(incomeToDelete)}
        title="Excluir renda extra?"
        onCancel={() => {
          if (!isDeleting) {
            setIncomeToDelete(null);
          }
        }}
        onConfirm={() => void handleDelete()}
      />
    </div>
  );
}
