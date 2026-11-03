"use client";

import Link from "next/link";
import { Pause, Play, Repeat, Trash2 } from "lucide-react";
import { useFinance } from "@/lib/use-finance";
import { formatBRL } from "@/lib/format";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function DespesasFixasPage() {
  const { ready, recurring, updateRecurring, removeRecurring } = useFinance();

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
          Aqui você pausa, reativa ou exclui o que já é fixo. Novas despesas
          fixas nascem ao salvar um comprovante (Foto) e indicar que é fixa.
        </p>
      </div>

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
            <CardContent className="py-8 text-center text-sm text-slate-500">
              Nenhuma despesa fixa ainda. Quando você salvar um comprovante
              como fixa, ela aparece aqui.
            </CardContent>
          </Card>
        )}

        {recurring.map((r) => (
          <Card key={r.id} className={!r.active ? "opacity-70" : undefined}>
            <CardContent className="flex flex-col gap-3 py-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="min-w-0">
                <p className="break-words font-semibold text-slate-900">
                  {r.description}
                </p>
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
              <div className="flex w-full shrink-0 flex-col gap-2 sm:w-auto sm:flex-row sm:flex-wrap sm:items-center">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="w-full sm:w-auto"
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
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="w-full border-rose-200 text-rose-700 hover:bg-rose-50 sm:w-auto"
                  title="Excluir"
                  onClick={() => {
                    if (
                      confirm(
                        "Excluir esta despesa fixa?\n\nEla some da lista e para de repetir. Os lançamentos já feitos em Transações ficam."
                      )
                    ) {
                      removeRecurring(r.id);
                    }
                  }}
                >
                  <Trash2 className="h-4 w-4" />
                  Excluir
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
