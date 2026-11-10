"use client";

import { forwardRef } from "react";
import { Info, TriangleAlert } from "lucide-react";

import { AiDataDisclaimer } from "@/components/investments/DataInfo";
import { Card } from "@/components/ui/Card";
import { formatDateBR } from "@/lib/dates";
import { assumptionLabels, formatDateTimeBR } from "@/lib/investment-format";
import { formatMoneyString, formatRate, notCalculated, profitLabel } from "@/lib/investment-money";
import type { SimulationResponse } from "@/types/investment";

const timelineLabels: Record<string, string> = {
  contribution: "Aporte",
  distribution: "Provento recebido",
  reinvestment: "Reinvestimento",
  end: "Encerramento (venda/resgate hipotético)",
};

function Row({ label, value, note, strong }: { label: string; value: string; note?: string; strong?: boolean }) {
  return (
    <div className="flex flex-col gap-0.5 border-b border-slate-100 py-2.5 last:border-b-0 sm:flex-row sm:items-baseline sm:justify-between sm:gap-4">
      <dt className="text-sm text-slate-600">
        {label}
        {note ? <span className="block text-xs text-slate-400">{note}</span> : null}
      </dt>
      <dd className={strong ? "text-base font-extrabold text-slate-900" : "text-sm font-semibold text-slate-800"}>{value}</dd>
    </div>
  );
}

function signedMoney(value: string) {
  const parsed = Number(value);
  const text = formatMoneyString(value);

  // The sign is spelled out so profit/loss never depends on color alone.
  return parsed > 0 && text !== "***" ? `+${text}` : text;
}

export const SimulationResult = forwardRef<
  HTMLHeadingElement,
  { result: SimulationResponse; assetName: string; rankingPeriodLabel: string; horizonDiffersFromRanking: boolean; isCdb: boolean }
>(function SimulationResult({ result, assetName, rankingPeriodLabel, horizonDiffersFromRanking, isCdb }, headingRef) {
  const grossOnly = result.net_profit === null || result.final_net_amount === null;
  const isProjection = result.mode === "projection";

  return (
    <div className="space-y-4">
      <div>
        <h2 ref={headingRef} className="text-xl font-extrabold text-slate-900 outline-none" tabIndex={-1}>
          Resultado: {assetName}
        </h2>
        <p className="mt-1 text-sm text-slate-600">
          {isProjection ? "Projeção" : "Histórico"} de {result.period_months} {result.period_months === 1 ? "mês" : "meses"} ·{" "}
          {result.contribution_type === "monthly" ? "aporte mensal" : "aporte único"} de {formatMoneyString(result.amount)}
        </p>
        <p className="text-xs text-slate-500">
          Período: {formatDateBR(result.effective_start_date ?? result.start_date)} a {formatDateBR(result.effective_end_date)}
          {isProjection ? " (datas futuras, hipotéticas)" : ""}
          {horizonDiffersFromRanking ? ` · Janela do ranking: ${rankingPeriodLabel} (não é o horizonte)` : ""}
        </p>
      </div>

      <div className="flex items-start gap-3 rounded-[10px] border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800" role="note">
        <TriangleAlert aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
        <span>
          <strong>Estimativa não garantida.</strong> Pode haver perdas e o histórico não garante resultados futuros.
          Valores nominais, sem ajuste de inflação, com venda/resgate hipotético no encerramento.
          {grossOnly ? " Resultado bruto; impostos/custos não calculados." : ""}
        </span>
      </div>

      <Card>
        <h3 className="mb-1 text-sm font-semibold uppercase tracking-wide text-slate-500">Resumo</h3>
        <dl>
          <Row label="Total aportado" value={formatMoneyString(result.total_contributed)} note="Rendimento não incluído" />
          <Row label="Patrimônio bruto final" strong value={formatMoneyString(result.gross_final_amount)} note="Ativo + caixa, antes de impostos e custos" />
          <Row label={profitLabel(result.gross_profit)} strong value={signedMoney(result.gross_profit)} />
          <Row
            label="Valorização do ativo"
            value={result.price_gain !== null ? signedMoney(result.price_gain) : "Não separada neste tipo de simulação"}
          />
          <Row
            label="Proventos recebidos"
            value={result.distributions_received !== null ? formatMoneyString(result.distributions_received) : "Não separados neste tipo de simulação"}
          />
          <Row
            label="Proventos reinvestidos"
            value={result.distributions_reinvested !== null ? formatMoneyString(result.distributions_reinvested) : "Não aplicável"}
            note="Informativo: já incluídos no valor do ativo, não somados de novo"
          />
          <Row label="Saldo em caixa" value={formatMoneyString(result.cash_balance)} note="Sobras de cotas inteiras e proventos não reinvestidos" />
          <Row label="Custos" value={formatMoneyString(result.fees)} />
          <Row label="Imposto de renda (IR)" value={formatMoneyString(result.ir)} />
          <Row label="IOF" value={formatMoneyString(result.iof)} />
          {grossOnly ? (
            <Row label="Lucro líquido / patrimônio líquido" value={notCalculated} note="Resultado bruto; impostos/custos não calculados" />
          ) : (
            <>
              <Row label="Lucro líquido estimado" strong value={signedMoney(result.net_profit as string)} />
              <Row label="Patrimônio líquido estimado" strong value={formatMoneyString(result.final_net_amount)} />
            </>
          )}
        </dl>
        {!isCdb ? (
          <p className="mt-3 text-xs text-slate-500">Cálculo simplificado: não é apuração fiscal pessoal e não considera sua situação tributária.</p>
        ) : null}
      </Card>

      {result.lots && result.lots.length ? (
        <Card>
          <details>
            <summary className="cursor-pointer text-sm font-semibold text-slate-800">Detalhe por aporte (lotes do CDB)</summary>
            <div className="mt-3 overflow-x-auto">
              <table className="w-full min-w-[640px] text-left text-xs">
                <thead className="text-slate-500">
                  <tr>
                    <th className="py-1 pr-3">Aporte</th>
                    <th className="py-1 pr-3">Dias</th>
                    <th className="py-1 pr-3">Principal</th>
                    <th className="py-1 pr-3">Ganho bruto</th>
                    <th className="py-1 pr-3">IOF</th>
                    <th className="py-1 pr-3">IR</th>
                    <th className="py-1">Líquido</th>
                  </tr>
                </thead>
                <tbody>
                  {result.lots.map((lot) => (
                    <tr key={`${lot.contribution_date}-${lot.product_terms_version}`} className="border-t border-slate-100">
                      <td className="py-1.5 pr-3">{formatDateBR(lot.contribution_date)}</td>
                      <td className="py-1.5 pr-3">{lot.calendar_days}</td>
                      <td className="py-1.5 pr-3">{formatMoneyString(lot.principal)}</td>
                      <td className="py-1.5 pr-3">{formatMoneyString(lot.gross_gain)}</td>
                      <td className="py-1.5 pr-3">
                        {formatMoneyString(lot.iof)}
                        {lot.iof_rate !== null ? ` (${formatRate(lot.iof_rate)})` : ""}
                      </td>
                      <td className="py-1.5 pr-3">
                        {formatMoneyString(lot.ir)}
                        {lot.ir_rate !== null ? ` (${formatRate(lot.ir_rate)})` : ""}
                      </td>
                      <td className="py-1.5">{formatMoneyString(lot.net_amount)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="mt-2 text-xs text-slate-500">
              IR e IOF consideram a idade de cada aporte até o resgate hipotético. Condições do produto: {result.lots[0]?.product_terms_version}.
            </p>
          </details>
        </Card>
      ) : null}

      <Card>
        <details>
          <summary className="cursor-pointer text-sm font-semibold text-slate-800">Aportes e linha do tempo</summary>
          <div className="mt-3 space-y-4 overflow-x-auto">
            <table className="w-full min-w-[420px] text-left text-xs">
              <thead className="text-slate-500">
                <tr>
                  <th className="py-1 pr-3">Data planejada</th>
                  <th className="py-1 pr-3">Data efetiva</th>
                  <th className="py-1">Valor</th>
                </tr>
              </thead>
              <tbody>
                {result.contributions.map((contribution, index) => (
                  <tr key={`${contribution.scheduled_date}-${index}`} className="border-t border-slate-100">
                    <td className="py-1.5 pr-3">{formatDateBR(contribution.scheduled_date)}</td>
                    <td className="py-1.5 pr-3">{contribution.effective_date ? formatDateBR(contribution.effective_date) : "Não executado"}</td>
                    <td className="py-1.5">{formatMoneyString(contribution.amount)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <table className="w-full min-w-[480px] text-left text-xs">
              <thead className="text-slate-500">
                <tr>
                  <th className="py-1 pr-3">Data</th>
                  <th className="py-1 pr-3">Evento</th>
                  <th className="py-1 pr-3">Valor</th>
                  <th className="py-1">Valor de mercado</th>
                </tr>
              </thead>
              <tbody>
                {result.timeline.map((event, index) => (
                  <tr key={`${event.date}-${event.type}-${index}`} className="border-t border-slate-100">
                    <td className="py-1.5 pr-3">{formatDateBR(event.date)}</td>
                    <td className="py-1.5 pr-3">{timelineLabels[event.type] ?? event.type}</td>
                    <td className="py-1.5 pr-3">{event.type === "end" ? "—" : formatMoneyString(event.amount)}</td>
                    <td className="py-1.5">{event.market_value !== null ? formatMoneyString(event.market_value) : "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </details>
      </Card>

      <Card>
        <details>
          <summary className="cursor-pointer text-sm font-semibold text-slate-800">Premissas, fontes e versões</summary>
          <dl className="mt-3 space-y-1 text-xs text-slate-600">
            {Object.entries(result.assumptions).map(([key, value]) => (
              <div key={key} className="flex flex-col sm:flex-row sm:gap-2">
                <dt className="font-semibold text-slate-700">{assumptionLabels[key] ?? key}:</dt>
                <dd>{value === null ? "—" : String(value)}</dd>
              </div>
            ))}
          </dl>
          <dl className="mt-3 grid gap-1 text-xs text-slate-600 sm:grid-cols-2">
            <div>
              <dt className="font-semibold text-slate-700">Data de referência</dt>
              <dd>{formatDateBR(result.data_reference_date)}</dd>
            </div>
            <div>
              <dt className="font-semibold text-slate-700">Última atualização</dt>
              <dd>{formatDateTimeBR(result.last_successful_update_at)}</dd>
            </div>
            <div>
              <dt className="font-semibold text-slate-700">Versão dos dados / metodologia</dt>
              <dd>
                {result.dataset_version} · {result.methodology_version}
              </dd>
            </div>
            <div>
              <dt className="font-semibold text-slate-700">Regra tributária</dt>
              <dd>{result.tax_rule_version ?? notCalculated}</dd>
            </div>
            <div className="sm:col-span-2">
              <dt className="font-semibold text-slate-700">Fontes</dt>
              <dd>
                {result.sources.map((source) =>
                  source.source_url ? (
                    <a key={source.code} className="mr-3 underline" href={source.source_url} rel="noreferrer" target="_blank">
                      {source.name}
                    </a>
                  ) : (
                    <span key={source.code} className="mr-3">
                      {source.name}
                    </span>
                  ),
                )}
              </dd>
            </div>
          </dl>
        </details>
      </Card>

      {result.warnings.length ? (
        <ul className="space-y-1.5 rounded-[10px] bg-slate-50 p-4 text-xs leading-5 text-slate-600">
          {result.warnings.map((warning) => (
            <li key={warning} className="flex items-start gap-2">
              <Info aria-hidden="true" className="mt-0.5 size-3.5 shrink-0" />
              <span>{warning}</span>
            </li>
          ))}
        </ul>
      ) : null}
      <AiDataDisclaimer />
    </div>
  );
});
