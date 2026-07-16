"use client";

import { useMemo, useState } from "react";
import { Trash2, Filter } from "lucide-react";
import { useFinance } from "@/lib/use-finance";
import { formatBRL, formatDateBR, monthLabel } from "@/lib/format";
import { Button } from "@/components/ui/button";
import { Select, Label } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { TransactionType } from "@/lib/types";

export default function TransacoesPage() {
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [typeFilter, setTypeFilter] = useState<"todos" | TransactionType>("todos");
  const { ready, monthTx, removeTransaction, summary } = useFinance({ year, month });

  const filtered = useMemo(() => {
    if (typeFilter === "todos") return monthTx;
    return monthTx.filter((t) => t.type === typeFilter);
  }, [monthTx, typeFilter]);

  if (!ready) {
    return <p className="text-sm text-slate-500">Carregando…</p>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Transações</h1>
        <p className="text-sm capitalize text-slate-600">
          {monthLabel(`${year}-${String(month).padStart(2, "0")}`)} · {filtered.length}{" "}
          lançamento(s)
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-sm font-medium">
            <Filter className="h-4 w-4" />
            Filtros
          </CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          <div>
            <Label>Mês</Label>
            <Select
              value={String(month)}
              onChange={(e) => setMonth(Number(e.target.value))}
            >
              {Array.from({ length: 12 }, (_, i) => (
                <option key={i + 1} value={i + 1}>
                  {new Date(2000, i, 1).toLocaleDateString("pt-BR", { month: "long" })}
                </option>
              ))}
            </Select>
          </div>
          <div>
            <Label>Ano</Label>
            <Select
              value={String(year)}
              onChange={(e) => setYear(Number(e.target.value))}
            >
              {[year - 1, year, year + 1].map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </Select>
          </div>
          <div className="col-span-2 sm:col-span-1">
            <Label>Tipo</Label>
            <Select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value as typeof typeFilter)}
            >
              <option value="todos">Todos</option>
              <option value="receita">Receitas</option>
              <option value="despesa">Despesas</option>
            </Select>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-3 gap-2 text-center text-sm">
        <div className="rounded-xl bg-emerald-50 p-3">
          <p className="text-xs text-emerald-700">Receitas</p>
          <p className="font-bold text-emerald-800">{formatBRL(summary.receitas)}</p>
        </div>
        <div className="rounded-xl bg-rose-50 p-3">
          <p className="text-xs text-rose-700">Despesas</p>
          <p className="font-bold text-rose-800">{formatBRL(summary.despesas)}</p>
        </div>
        <div className="rounded-xl bg-slate-900 p-3 text-white">
          <p className="text-xs text-slate-300">Lucro</p>
          <p className="font-bold">{formatBRL(summary.lucro)}</p>
        </div>
      </div>

      <ul className="divide-y divide-slate-100 overflow-hidden rounded-2xl border border-slate-200 bg-white">
        {filtered.length === 0 ? (
          <li className="p-8 text-center text-sm text-slate-500">
            Nenhuma transação neste período.
          </li>
        ) : (
          filtered.map((t) => (
            <li key={t.id} className="flex items-center gap-3 px-4 py-3">
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">{t.description || t.category}</p>
                <p className="text-xs text-slate-500">
                  {formatDateBR(t.date)} · {t.category}
                  {t.is_deductible && " · dedutível"}
                  {t.ai_confidence != null && " · IA"}
                </p>
              </div>
              <span
                className={`shrink-0 text-sm font-semibold ${
                  t.type === "receita" ? "text-emerald-700" : "text-rose-600"
                }`}
              >
                {t.type === "receita" ? "+" : "−"}
                {formatBRL(t.amount)}
              </span>
              <Button
                variant="ghost"
                size="icon"
                aria-label="Excluir"
                onClick={() => {
                  if (confirm("Excluir esta transação?")) removeTransaction(t.id);
                }}
              >
                <Trash2 className="h-4 w-4 text-slate-400" />
              </Button>
            </li>
          ))
        )}
      </ul>
    </div>
  );
}
