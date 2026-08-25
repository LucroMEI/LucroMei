"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Trash2, Filter, Repeat, Pencil, X } from "lucide-react";
import { useFinance } from "@/lib/use-finance";
import { formatBRL, formatDateBR, monthLabel } from "@/lib/format";
import { dayFromIsoDate } from "@/lib/recurring";
import { DEFAULT_CATEGORIES } from "@/lib/categories";
import { Button } from "@/components/ui/button";
import { Input, Select, Label } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Transaction, TransactionType } from "@/lib/types";

export default function TransacoesPage() {
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [typeFilter, setTypeFilter] = useState<"todos" | TransactionType>("todos");
  const {
    ready,
    monthTx,
    removeTransaction,
    updateTransaction,
    updateRecurring,
    summary,
    recurring,
  } = useFinance({ year, month });

  const [editing, setEditing] = useState<Transaction | null>(null);
  const [editAmount, setEditAmount] = useState("");
  const [editDate, setEditDate] = useState("");
  const [editDesc, setEditDesc] = useState("");
  const [editCategory, setEditCategory] = useState("");
  const [editType, setEditType] = useState<TransactionType>("despesa");
  const [editDeductible, setEditDeductible] = useState(true);

  const filtered = useMemo(() => {
    if (typeFilter === "todos") return monthTx;
    return monthTx.filter((t) => t.type === typeFilter);
  }, [monthTx, typeFilter]);

  const activeFixed = recurring.filter((r) => r.active).length;

  const categories = useMemo(
    () =>
      DEFAULT_CATEGORIES.filter(
        (c) => c.type === editType || c.type === "ambos"
      ),
    [editType]
  );

  function openEdit(t: Transaction) {
    setEditing(t);
    setEditAmount(
      t.amount.toLocaleString("pt-BR", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })
    );
    setEditDate(t.date);
    setEditDesc(t.description || "");
    setEditCategory(t.category);
    setEditType(t.type);
    setEditDeductible(t.is_deductible);
  }

  function saveEdit() {
    if (!editing) return;
    const normalized = editAmount.trim().replace(/\s/g, "");
    const amountNum = normalized.includes(",")
      ? Number(normalized.replace(/\./g, "").replace(",", "."))
      : Number(normalized.replace(",", "."));
    if (!Number.isFinite(amountNum) || amountNum <= 0) {
      alert("Informe um valor válido.");
      return;
    }

    updateTransaction(editing.id, {
      amount: amountNum,
      date: editDate,
      description: editDesc.trim() || editing.category,
      category: editCategory,
      type: editType,
      is_deductible: editType === "despesa" ? editDeductible : false,
    });

    // Se veio de despesa fixa, atualiza a regra (aparece na caixa Despesas fixas)
    if (editing.recurring_id) {
      const cleanDesc = editDesc
        .replace(/\s*\(fixa\)\s*$/i, "")
        .replace(/\s*\(anual\)\s*$/i, "")
        .replace(/\s*\(\d+\/\d+\)\s*$/i, "")
        .trim();
      updateRecurring(editing.recurring_id, {
        description: cleanDesc || editCategory,
        amount: amountNum,
        day_of_month: dayFromIsoDate(editDate),
        category: editCategory,
        is_deductible: editType === "despesa" ? editDeductible : true,
      });
    }

    setEditing(null);
  }

  if (!ready) {
    return <p className="text-sm text-slate-500">Carregando…</p>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Transações</h1>
          <p className="text-sm capitalize text-slate-500">
            {monthLabel(`${year}-${String(month).padStart(2, "0")}`)} ·{" "}
            {filtered.length} lançamento(s)
          </p>
        </div>
      </div>

      <Link href="/despesas-fixas" className="block">
        <Card className="border-slate-200 transition hover:border-emerald-300 hover:bg-emerald-50/40">
          <CardContent className="flex items-center gap-3 py-4">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-600 text-white">
              <Repeat className="h-5 w-5" strokeWidth={2.25} />
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-bold text-slate-800">Despesas fixas</p>
              <p className="text-xs text-slate-500">
                {activeFixed > 0
                  ? `${activeFixed} ativa${activeFixed === 1 ? "" : "s"} · toque para gerir`
                  : "Assinaturas e parcelas · toque para cadastrar"}
              </p>
            </div>
            <span className="text-sm font-semibold text-emerald-700">Abrir</span>
          </CardContent>
        </Card>
      </Link>

      <Card className="border-slate-200 bg-white">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-sm font-medium text-slate-700">
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
                  {new Date(2000, i, 1).toLocaleDateString("pt-BR", {
                    month: "long",
                  })}
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
              onChange={(e) =>
                setTypeFilter(e.target.value as typeof typeFilter)
              }
            >
              <option value="todos">Todos</option>
              <option value="receita">Receitas</option>
              <option value="despesa">Despesas</option>
            </Select>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-3 gap-2 text-center text-sm">
        <div className="rounded-xl border border-emerald-100 bg-emerald-50 p-3">
          <p className="text-xs text-emerald-700">Receitas</p>
          <p className="font-bold text-emerald-800">
            {formatBRL(summary.receitas)}
          </p>
        </div>
        <div className="rounded-xl border border-rose-100 bg-rose-50 p-3">
          <p className="text-xs text-rose-700">Despesas</p>
          <p className="font-bold text-rose-800">
            {formatBRL(summary.despesas)}
          </p>
        </div>
        <div className="rounded-xl bg-emerald-700 p-3 text-white">
          <p className="text-xs text-emerald-100">Lucro</p>
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
            <li key={t.id} className="flex items-center gap-2 px-4 py-3 sm:gap-3">
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-slate-800">
                  {t.description || t.category}
                </p>
                <p className="text-xs text-slate-500">
                  {formatDateBR(t.date)} · {t.category}
                  {t.is_deductible && " · negócio"}
                  {t.source === "recorrente" && " · fixa"}
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
                aria-label="Modificar"
                onClick={() => openEdit(t)}
              >
                <Pencil className="h-4 w-4 text-slate-500" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                aria-label="Excluir"
                onClick={() => {
                  if (confirm("Excluir esta transação?"))
                    removeTransaction(t.id);
                }}
              >
                <Trash2 className="h-4 w-4 text-slate-400" />
              </Button>
            </li>
          ))
        )}
      </ul>

      {editing && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-0 sm:items-center sm:p-4">
          <div className="max-h-[90dvh] w-full max-w-md overflow-y-auto rounded-t-2xl bg-white p-5 shadow-xl sm:rounded-2xl">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-bold text-slate-800">
                Modificar lançamento
              </h2>
              <button
                type="button"
                className="rounded-lg p-2 hover:bg-slate-100"
                onClick={() => setEditing(null)}
                aria-label="Fechar"
              >
                <X className="h-5 w-5 text-slate-500" />
              </button>
            </div>
            {editing.recurring_id && (
              <p className="mb-3 rounded-xl border border-emerald-100 bg-emerald-50 px-3 py-2 text-xs text-emerald-900">
                Esta despesa está ligada a uma <strong>despesa fixa</strong>. Ao
                salvar, a regra em Despesas fixas também é atualizada.
              </p>
            )}
            <div className="space-y-3">
              <div>
                <Label htmlFor="ed-desc">Descrição / nome</Label>
                <Input
                  id="ed-desc"
                  value={editDesc}
                  onChange={(e) => setEditDesc(e.target.value)}
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="ed-amount">Valor (R$)</Label>
                  <Input
                    id="ed-amount"
                    value={editAmount}
                    onChange={(e) => setEditAmount(e.target.value)}
                    inputMode="decimal"
                  />
                </div>
                <div>
                  <Label htmlFor="ed-date">Data</Label>
                  <Input
                    id="ed-date"
                    type="date"
                    value={editDate}
                    onChange={(e) => setEditDate(e.target.value)}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Tipo</Label>
                  <Select
                    value={editType}
                    onChange={(e) => {
                      const t = e.target.value as TransactionType;
                      setEditType(t);
                      setEditCategory(
                        t === "receita"
                          ? "Vendas / Serviços"
                          : "Outras despesas"
                      );
                      setEditDeductible(t === "despesa");
                    }}
                  >
                    <option value="despesa">Despesa</option>
                    <option value="receita">Receita</option>
                  </Select>
                </div>
                <div>
                  <Label>Categoria</Label>
                  <Select
                    value={editCategory}
                    onChange={(e) => setEditCategory(e.target.value)}
                  >
                    {categories.map((c) => (
                      <option key={c.name} value={c.name}>
                        {c.name}
                      </option>
                    ))}
                  </Select>
                </div>
              </div>
              {editType === "despesa" && (
                <label className="flex items-center gap-2 text-sm text-slate-700">
                  <input
                    type="checkbox"
                    checked={editDeductible}
                    onChange={(e) => setEditDeductible(e.target.checked)}
                    className="h-4 w-4 rounded border-slate-300 text-emerald-600"
                  />
                  <span>
                    <span className="font-medium">Gasto do negócio (MEI)</span>
                    <span className="mt-0.5 block text-xs text-slate-500">
                      Desmarque se for despesa pessoal
                    </span>
                  </span>
                </label>
              )}
              <div className="flex flex-col gap-2 pt-2 sm:flex-row">
                <Button type="button" className="w-full" onClick={saveEdit}>
                  Salvar alterações
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="w-full"
                  onClick={() => setEditing(null)}
                >
                  Cancelar
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
