"use client";

import {
  Bar,
  CartesianGrid,
  ComposedChart,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { Card } from "@/components/ui/Card";
import { formatCurrencyBRL } from "@/lib/currency";
import type { DashboardChartPoint } from "@/types/dashboard";

function formatMonthTick(value: string) {
  const date = new Date(`${value}-01T12:00:00`);

  return new Intl.DateTimeFormat("pt-BR", {
    month: "short",
    year: "2-digit",
  }).format(date);
}

function formatAxisCurrency(value: number) {
  if (Math.abs(value) >= 1000) {
    return `R$ ${Math.round(value / 1000)} mil`;
  }

  return formatCurrencyBRL(value);
}

function getBalanceDomain([dataMin, dataMax]: readonly [number, number]): [number, number] {
  const range = Math.max(1000, dataMax - dataMin);
  const padding = range * 0.16;
  const min = Math.min(0, dataMin - padding);
  const max = dataMax + padding;

  return [Math.floor(min / 500) * 500, Math.ceil(max / 500) * 500];
}

export function MonthlyChart({
  data,
  compact = false,
}: {
  data: DashboardChartPoint[];
  compact?: boolean;
}) {
  const maxExpenseAmount = Math.max(
    1,
    ...data.map((item) => item.total_bills_amount + item.quick_expenses_total),
  );
  const expensesAxisMax = compact ? maxExpenseAmount * 4.8 : maxExpenseAmount + 500;

  return (
    <Card
      className={
        compact
          ? "flex h-[172px] flex-col rounded-[10px] p-5"
          : "flex h-[330px] flex-col rounded-[10px] p-5"
      }
    >
      <div className={compact ? "mb-2" : "mb-3 flex items-start justify-between gap-4"}>
        <div>
          <h3
            className={
              compact
                ? "text-base font-extrabold text-slate-900"
                : "text-xl font-extrabold text-slate-900"
            }
          >
            Tendência
            {!compact ? " dos próximos meses" : ""}
          </h3>
          <p
            className={
              compact ? "mt-1 text-[10px] text-slate-500" : "mt-1 text-sm text-slate-600"
            }
          >
            {compact
              ? "Evolução do saldo nos próximos meses."
              : "Contas, gastos rápidos e saldo previsto em uma visão compacta."}
          </p>
        </div>
        {!compact ? (
          <div className="mt-0.5 flex shrink-0 flex-wrap justify-end gap-2 text-[11px] font-semibold">
            <span className="inline-flex items-center gap-2 rounded-[10px] bg-[var(--color-primary-soft)] px-2.5 py-1 text-[#071a3d]">
              <span className="size-2 rounded-[10px] bg-[var(--color-primary)]" />
              Saldo
            </span>
            <span className="inline-flex items-center gap-2 rounded-[10px] bg-[var(--color-brand-blue-soft)] px-2.5 py-1 text-[#64748b]">
              <span className="h-2 w-3 rounded-[10px] bg-[#b7c9f2]" />
              Contas
            </span>
            <span className="inline-flex items-center gap-2 rounded-[10px] bg-slate-50 px-2.5 py-1 text-[#64748b]">
              <span className="h-2 w-3 rounded-[10px] bg-[#f4e2a3]" />
              Gastos rápidos
            </span>
          </div>
        ) : null}
      </div>
      <div
        className={
          compact ? "h-[104px] min-h-[104px] min-w-[1px]" : "h-[242px] min-h-[242px] min-w-[1px]"
        }
      >
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart
            data={data}
            margin={
              compact
                ? { left: 0, right: 0, top: 10, bottom: -4 }
                : { left: -8, right: 8, top: 8, bottom: 12 }
            }
          >
          {!compact ? <CartesianGrid stroke="#e2e8f0" strokeDasharray="3 3" vertical={false} /> : null}
          <XAxis
            axisLine={false}
            dataKey="month"
            tickFormatter={formatMonthTick}
            interval={compact ? 1 : 1}
            height={compact ? 20 : 34}
            tick={{ fill: "#64748b", fontSize: compact ? 8 : 11 }}
            tickLine={false}
            tickMargin={compact ? 4 : 12}
          />
          <YAxis
            yAxisId="balance"
            hide={compact}
            axisLine={false}
            domain={getBalanceDomain}
            tick={{ fill: "#64748b", fontSize: 11 }}
            tickFormatter={(value) => formatAxisCurrency(Number(value ?? 0))}
            tickLine={false}
            tickMargin={10}
            width={68}
          />
          <YAxis
            yAxisId="expenses"
            hide
            domain={[0, expensesAxisMax]}
          />
          <Tooltip
            formatter={(value) => formatCurrencyBRL(Number(value ?? 0))}
            labelFormatter={(value) => formatMonthTick(String(value))}
            contentStyle={{
              borderRadius: "18px",
              border: "1px solid #e2e8f0",
              boxShadow: "0 14px 40px rgba(15, 23, 42, 0.12)",
            }}
          />
          {!compact ? (
            <>
              <Bar
                yAxisId="expenses"
                barSize={14}
                dataKey="total_bills_amount"
                fill="#b7c9f2"
                name="Contas"
                radius={[10, 10, 0, 0]}
              />
              <Bar
                yAxisId="expenses"
                barSize={10}
                dataKey="quick_expenses_total"
                fill="#f4e2a3"
                name="Gastos rápidos"
                radius={[10, 10, 0, 0]}
              />
            </>
          ) : null}
          <Line
            yAxisId="balance"
            activeDot={{ r: compact ? 3 : 6 }}
            dataKey="projected_balance"
            dot={{ fill: "#e0ad00", r: compact ? 1.8 : 4 }}
            name="Saldo previsto"
            stroke="#e0ad00"
            strokeWidth={compact ? 2 : 2.5}
            type="monotone"
          />
        </ComposedChart>
      </ResponsiveContainer>
      </div>
    </Card>
  );
}
