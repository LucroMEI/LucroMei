"use client";

import { useMemo, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  Cell,
} from "recharts";
import { Download } from "lucide-react";
import { useFinance } from "@/lib/use-finance";
import { formatBRL, monthLabel } from "@/lib/format";
import { filterByMonth, summarizeMonth } from "@/lib/taxes";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Disclaimer } from "@/components/disclaimer";

export default function RelatoriosPage() {
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const { ready, transactions, settings } = useFinance();

  const months = useMemo(() => {
    return Array.from({ length: 12 }, (_, i) => {
      const m = i + 1;
      const tx = filterByMonth(transactions, year, m);
      const s = summarizeMonth(tx, {
        regime: settings?.regime_tributario,
        atividade: settings?.atividade_mei,
      });
      return {
        month: m,
        label: new Date(year, i, 1).toLocaleDateString("pt-BR", { month: "short" }),
        receitas: s.receitas,
        despesas: s.despesas,
        lucro: s.lucro,
        imposto: s.impostoEstimado,
        count: s.count,
      };
    });
  }, [transactions, year, settings]);

  const yearTotals = useMemo(() => {
    return months.reduce(
      (acc, m) => ({
        receitas: acc.receitas + m.receitas,
        despesas: acc.despesas + m.despesas,
        lucro: acc.lucro + m.lucro,
        imposto: acc.imposto + m.imposto,
      }),
      { receitas: 0, despesas: 0, lucro: 0, imposto: 0 }
    );
  }, [months]);

  const byCategory = useMemo(() => {
    const map = new Map<string, number>();
    for (const t of transactions) {
      if (!t.date.startsWith(String(year))) continue;
      if (t.type !== "despesa") continue;
      map.set(t.category, (map.get(t.category) || 0) + Number(t.amount));
    }
    return [...map.entries()]
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 8);
  }, [transactions, year]);

  function exportCsv() {
    const rows = [
      ["data", "tipo", "categoria", "descricao", "valor", "dedutivel"],
      ...transactions
        .filter((t) => t.date.startsWith(String(year)))
        .map((t) => [
          t.date,
          t.type,
          t.category,
          (t.description || "").replace(/"/g, "'"),
          String(t.amount).replace(".", ","),
          t.is_deductible ? "sim" : "nao",
        ]),
    ];
    const csv = rows.map((r) => r.map((c) => `"${c}"`).join(";")).join("\n");
    const blob = new Blob(["\ufeff" + csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `lucromei-${year}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  if (!ready) return <p className="text-sm text-slate-500">Carregando…</p>;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Relatórios</h1>
          <p className="text-sm text-slate-600">Ano {year}</p>
        </div>
        <div className="flex gap-2">
          <select
            className="h-11 rounded-xl border border-slate-200 bg-white px-3 text-sm"
            value={year}
            onChange={(e) => setYear(Number(e.target.value))}
          >
            {[year - 1, year, year + 1].map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>
          <Button variant="outline" onClick={exportCsv}>
            <Download className="h-4 w-4" />
            Exportar CSV
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Mini label="Receitas" value={formatBRL(yearTotals.receitas)} />
        <Mini label="Despesas" value={formatBRL(yearTotals.despesas)} />
        <Mini label="Lucro" value={formatBRL(yearTotals.lucro)} dark />
        <Mini label="Impostos aprox." value={formatBRL(yearTotals.imposto)} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Receitas × Despesas por mês</CardTitle>
        </CardHeader>
        <CardContent className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={months}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="label" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 11 }} width={50} />
              <Tooltip
                formatter={(v) => formatBRL(Number(v ?? 0))}
                labelFormatter={(_, payload) => {
                  const m = payload?.[0]?.payload?.month;
                  return m
                    ? monthLabel(`${year}-${String(m).padStart(2, "0")}`)
                    : "";
                }}
              />
              <Bar dataKey="receitas" name="Receitas" fill="#059669" radius={[4, 4, 0, 0]} />
              <Bar dataKey="despesas" name="Despesas" fill="#e11d48" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Despesas por categoria ({year})</CardTitle>
        </CardHeader>
        <CardContent>
          {byCategory.length === 0 ? (
            <p className="text-sm text-slate-500">Sem despesas no período.</p>
          ) : (
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={byCategory} layout="vertical" margin={{ left: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis type="number" tick={{ fontSize: 11 }} />
                  <YAxis
                    type="category"
                    dataKey="name"
                    width={120}
                    tick={{ fontSize: 11 }}
                  />
                  <Tooltip formatter={(v) => formatBRL(Number(v ?? 0))} />
                  <Bar dataKey="value" name="Valor" radius={[0, 4, 4, 0]}>
                    {byCategory.map((_, i) => (
                      <Cell key={i} fill={i % 2 === 0 ? "#059669" : "#34d399"} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </CardContent>
      </Card>

      <Disclaimer />
    </div>
  );
}

function Mini({
  label,
  value,
  dark,
}: {
  label: string;
  value: string;
  dark?: boolean;
}) {
  return (
    <div
      className={`rounded-2xl p-4 ${
        dark ? "bg-slate-900 text-white" : "border border-slate-200 bg-white"
      }`}
    >
      <p className={`text-xs ${dark ? "text-slate-300" : "text-slate-500"}`}>{label}</p>
      <p className="mt-1 text-lg font-bold">{value}</p>
    </div>
  );
}
