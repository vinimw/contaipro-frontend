import { Info, TriangleAlert } from "lucide-react";

import { formatDateBR } from "@/lib/dates";
import { formatDateTimeBR } from "@/lib/investment-format";
import type { DataStatus, InvestmentSource } from "@/types/investment";

const statusCopy: Partial<Record<DataStatus["status"], string>> = {
  stale: "Os dados estão atrasados em relação ao prazo esperado e podem estar desatualizados.",
  partial: "Os dados estão parciais: nem todas as fontes foram atualizadas.",
  unavailable: "Os dados de mercado ainda não estão disponíveis.",
};

/** Banner for stale, partial or unavailable data. Fresh data renders nothing. */
export function DataStatusBanner({ status }: { status: DataStatus | undefined }) {
  const message = status ? statusCopy[status.status] : undefined;

  if (!message) {
    return null;
  }

  return (
    <div className="flex items-start gap-3 rounded-[10px] border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800" role="status">
      <TriangleAlert aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
      <span>{message}</span>
    </div>
  );
}

/** Permanent notice: part of the investment data is prepared with AI assistance and may differ from official sources. */
export function AiDataDisclaimer() {
  return (
    <p className="flex items-start gap-2 rounded-[10px] bg-slate-50 p-3 text-xs leading-5 text-slate-600" role="note">
      <Info aria-hidden="true" className="mt-0.5 size-3.5 shrink-0" />
      <span>
        Os dados exibidos são validados, mas podem apresentar variações. Parte da base é gerada com apoio de inteligência artificial.
        Use como referência e confirme as condições na instituição antes de investir.
      </span>
    </p>
  );
}

/** Source, reference date (market) and last collection (a different thing), plus API warnings. */
export function DataInfo({
  sources,
  dataReferenceDate,
  lastSuccessfulUpdateAt,
  warnings,
}: {
  sources: InvestmentSource[];
  dataReferenceDate: string | null;
  lastSuccessfulUpdateAt: string | null;
  warnings: string[];
}) {
  return (
    <div className="space-y-3 rounded-[10px] bg-slate-50 p-4 text-xs leading-5 text-slate-600">
      <dl className="grid gap-x-6 gap-y-1 sm:grid-cols-2">
        <div>
          <dt className="font-semibold text-slate-700">Data de referência do mercado</dt>
          <dd>{formatDateBR(dataReferenceDate)}</dd>
        </div>
        <div>
          <dt className="font-semibold text-slate-700">Última coleta bem-sucedida</dt>
          <dd>{formatDateTimeBR(lastSuccessfulUpdateAt)}</dd>
        </div>
        <div className="sm:col-span-2">
          <dt className="font-semibold text-slate-700">Fontes</dt>
          <dd>
            {sources.length
              ? sources.map((source) =>
                  source.source_url ? (
                    <a key={source.code} className="mr-3 underline" href={source.source_url} rel="noreferrer" target="_blank">
                      {source.name}
                    </a>
                  ) : (
                    <span key={source.code} className="mr-3">
                      {source.name}
                    </span>
                  ),
                )
              : "Não informadas"}
          </dd>
        </div>
      </dl>
      {warnings.length ? (
        <ul className="space-y-1">
          {warnings.map((warning) => (
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
}
