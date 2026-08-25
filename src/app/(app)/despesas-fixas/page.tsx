"use client";

import Link from "next/link";
import { Camera, Pause, Play, Repeat } from "lucide-react";
import { useFinance } from "@/lib/use-finance";
import { formatBRL } from "@/lib/format";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function DespesasFixasPage() {
  const { ready, recurring, updateRecurring } = useFinance();

  if (!ready) {
    return <p className="text-sm text-slate-500">Carregando…</p>;
  }

  const activeCount = recurring.filter((r) => r.active).length;

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <Link
          href="/transacoes"
          className="text-sm font-medium text-emerald-700 hover:underline"
        >
          ← Transações
        </Link>
        <h1 className="mt-2 flex items-center gap-2 text-2xl font-bold text-slate-900">
          <Repeat className="h-6 w-6 text-emerald-600" />
          Despesas fixas
        </h1>
        <p className="mt-1 text-sm text-slate-600">
          Aqui só geres o que já é fixo (pausar ou reativar). Para criar uma
          nova, tira foto ou envia o PDF do comprovante e, ao salvar, indica
          que é despesa fixa.
        </p>
      </div>

      <Link href="/upload" className="block">
        <Card className="border-emerald-200 bg-emerald-50/50 transition hover:border-emerald-300 hover:bg-emerald-50">
          <CardContent className="flex items-center gap-3 py-4">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-600 text-white">
              <Camera className="h-5 w-5" strokeWidth={2.25} />
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-bold text-slate-800">
                Nova despesa fixa pela Foto / PDF
              </p>
              <p className="text-xs text-slate-500">
                Ao salvar o comprovante, escolhe mensal, parcelas ou anual
              </p>
            </div>
            <span className="text-sm font-semibold text-emerald-700">Abrir</span>
          </CardContent>
        </Card>
      </Link>

      <p className="text-sm text-slate-500">
        {activeCount} ativa{activeCount === 1 ? "" : "s"}
        {recurring.length > activeCount
          ? ` · ${recurring.length - activeCount} pausada${recurring.length - activeCount === 1 ? "" : "s"}`
          : ""}
        . Para alterar nome ou valor, use <strong>Modificar</strong> na lista de
        Transações.
      </p>

      <div className="space-y-3">
        {recurring.length === 0 && (
          <Card>
            <CardContent className="space-y-3 py-8 text-center text-sm text-slate-500">
              <p>
                Nenhuma despesa fixa ainda. Fotografa ou envia o PDF da
                assinatura (Instagram, hosting, etc.) e marca como fixa ao
                salvar.
              </p>
              <Link
                href="/upload"
                className="inline-flex h-9 items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-800 hover:bg-slate-50"
              >
                <Camera className="h-4 w-4" />
                Ir para Upload
              </Link>
            </CardContent>
          </Card>
        )}

        {recurring.map((r) => (
          <Card key={r.id} className={!r.active ? "opacity-70" : undefined}>
            <CardContent className="flex flex-wrap items-center justify-between gap-3 py-4">
              <div className="min-w-0">
                <p className="font-semibold text-slate-900">{r.description}</p>
                <p className="text-sm text-slate-600">
                  {formatBRL(r.amount)}
                  {(r.frequency ?? "monthly") === "yearly"
                    ? ` · todo ano (mês ${r.month_of_year ?? "?"} dia ${r.day_of_month})`
                    : ` · todo dia ${r.day_of_month}`}
                  {" · "}
                  {r.category}
                  {r.installments_total != null &&
                    r.installments_total > 0 &&
                    (r.frequency ?? "monthly") === "monthly" && (
                      <span className="ml-1">
                        · {r.installments_generated ?? 0}/
                        {r.installments_total} parcelas
                      </span>
                    )}
                  {!r.active && (
                    <span className="ml-2 rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600">
                      Pausada
                    </span>
                  )}
                </p>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                title={r.active ? "Pausar" : "Reativar"}
                onClick={() => updateRecurring(r.id, { active: !r.active })}
              >
                {r.active ? (
                  <>
                    <Pause className="h-4 w-4" />
                    Pausar
                  </>
                ) : (
                  <>
                    <Play className="h-4 w-4" />
                    Reativar
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
