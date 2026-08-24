"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Pause, Play, Plus, Trash2, Pencil, Repeat } from "lucide-react";
import { useFinance } from "@/lib/use-finance";
import { formatBRL } from "@/lib/format";
import { DEFAULT_CATEGORIES, isDeductibleDefault } from "@/lib/categories";
import { clampDayOfMonth } from "@/lib/recurring";
import type { RecurringExpense } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input, Label, Select } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const PRESETS = [
  { label: "Instagram / Meta", category: "Marketing / Anúncios", day: 19 },
  { label: "Hosting / Vercel", category: "Software / Assinaturas", day: 1 },
  { label: "IA / Grok", category: "Software / Assinaturas", day: 1 },
  { label: "Domínio", category: "Software / Assinaturas", day: 10 },
];

const emptyForm = {
  description: "",
  amount: "",
  day_of_month: "1",
  category: "Software / Assinaturas",
  is_deductible: true,
  active: true,
  /** "" = todo mês; número = parcelas */
  installments_total: "",
};

export default function DespesasFixasPage() {
  const {
    ready,
    recurring,
    addRecurring,
    updateRecurring,
    removeRecurring,
  } = useFinance();

  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);

  const expenseCategories = useMemo(
    () =>
      DEFAULT_CATEGORIES.filter(
        (c) => c.type === "despesa" || c.type === "ambos"
      ),
    []
  );

  if (!ready) {
    return <p className="text-sm text-slate-500">Carregando…</p>;
  }

  function applyPreset(p: (typeof PRESETS)[number]) {
    setForm((f) => ({
      ...f,
      description: p.label,
      category: p.category,
      day_of_month: String(p.day),
      is_deductible: isDeductibleDefault(p.category),
      active: true,
      installments_total: "",
    }));
    setEditingId(null);
    setShowForm(true);
  }

  function startEdit(r: RecurringExpense) {
    setEditingId(r.id);
    setForm({
      description: r.description,
      amount: String(r.amount).replace(".", ","),
      day_of_month: String(r.day_of_month),
      category: r.category,
      is_deductible: r.is_deductible,
      active: r.active,
      installments_total:
        r.installments_total != null && r.installments_total > 0
          ? String(r.installments_total)
          : "",
    });
    setShowForm(true);
  }

  function resetForm() {
    setEditingId(null);
    setForm(emptyForm);
    setShowForm(false);
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const amount =
      Number(String(form.amount).replace(/\./g, "").replace(",", ".")) || 0;
    if (!form.description.trim() || amount <= 0) return;

    const parcelsRaw = form.installments_total.trim();
    const parcels = parcelsRaw
      ? Math.min(48, Math.max(2, Math.floor(Number(parcelsRaw) || 0)))
      : null;

    const payload = {
      description: form.description.trim(),
      amount,
      day_of_month: clampDayOfMonth(Number(form.day_of_month)),
      category: form.category,
      is_deductible: form.is_deductible,
      active: form.active,
      installments_total: parcels && parcels >= 2 ? parcels : null,
    };

    if (editingId) {
      updateRecurring(editingId, payload);
    } else {
      addRecurring({
        ...payload,
        installments_generated: 0,
      });
    }
    resetForm();
  }

  const activeCount = recurring.filter((r) => r.active).length;

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <Link
            href="/configuracoes"
            className="text-sm font-medium text-emerald-700 hover:underline"
          >
            ← Configurações
          </Link>
          <h1 className="mt-2 flex items-center gap-2 text-2xl font-bold text-slate-900">
            <Repeat className="h-6 w-6 text-emerald-600" />
            Despesas fixas
          </h1>
          <p className="mt-1 text-sm text-slate-600">
            Assinaturas todo mês ou compras parceladas no cartão. Também pode
            marcar isso ao salvar um comprovante.
          </p>
        </div>
        <Button
          type="button"
          onClick={() => {
            setEditingId(null);
            setForm(emptyForm);
            setShowForm(true);
          }}
        >
          <Plus className="h-4 w-4" />
          Adicionar
        </Button>
      </div>

      <p className="text-sm text-slate-500">
        {activeCount} ativa{activeCount === 1 ? "" : "s"}
        {recurring.length > activeCount
          ? ` · ${recurring.length - activeCount} pausada${recurring.length - activeCount === 1 ? "" : "s"}`
          : ""}
      </p>

      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">
              {editingId ? "Editar despesa fixa" : "Nova despesa fixa"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {!editingId && (
              <div className="mb-4 flex flex-wrap gap-2">
                {PRESETS.map((p) => (
                  <button
                    key={p.label}
                    type="button"
                    onClick={() => applyPreset(p)}
                    className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-medium text-slate-700 hover:border-emerald-300 hover:bg-emerald-50"
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            )}
            <form onSubmit={onSubmit} className="space-y-4">
              <div>
                <Label htmlFor="desc">Nome</Label>
                <Input
                  id="desc"
                  value={form.description}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, description: e.target.value }))
                  }
                  placeholder="Ex.: Meta Verified Instagram"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="amount">Valor (R$)</Label>
                  <Input
                    id="amount"
                    value={form.amount}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, amount: e.target.value }))
                    }
                    placeholder="99,90"
                    inputMode="decimal"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="day">Dia do mês</Label>
                  <Input
                    id="day"
                    type="number"
                    min={1}
                    max={28}
                    value={form.day_of_month}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, day_of_month: e.target.value }))
                    }
                    required
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="cat">Categoria</Label>
                <Select
                  id="cat"
                  value={form.category}
                  onChange={(e) => {
                    const category = e.target.value;
                    setForm((f) => ({
                      ...f,
                      category,
                      is_deductible: isDeductibleDefault(category),
                    }));
                  }}
                >
                  {expenseCategories.map((c) => (
                    <option key={c.name} value={c.name}>
                      {c.name}
                    </option>
                  ))}
                </Select>
              </div>
              <div>
                <Label htmlFor="parcels">Parcelas (opcional)</Label>
                <Input
                  id="parcels"
                  type="number"
                  min={2}
                  max={48}
                  placeholder="Vazio = todo mês (assinatura)"
                  value={form.installments_total}
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      installments_total: e.target.value,
                    }))
                  }
                />
                <p className="mt-1 text-xs text-slate-500">
                  Ex.: 12 para compra no cartão em 12×. Deixe vazio se for
                  assinatura contínua.
                </p>
              </div>
              <label className="flex items-center gap-2 text-sm text-slate-700">
                <input
                  type="checkbox"
                  checked={form.is_deductible}
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      is_deductible: e.target.checked,
                    }))
                  }
                  className="h-4 w-4 rounded border-slate-300 text-emerald-600"
                />
                Despesa dedutível da atividade
              </label>
              <div className="flex flex-wrap gap-2">
                <Button type="submit">
                  {editingId ? "Salvar alterações" : "Criar despesa fixa"}
                </Button>
                <Button type="button" variant="outline" onClick={resetForm}>
                  Cancelar
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <div className="space-y-3">
        {recurring.length === 0 && !showForm && (
          <Card>
            <CardContent className="py-8 text-center text-sm text-slate-500">
              Nenhuma despesa fixa ainda. Adicione Instagram, hosting, Grok e
              outras assinaturas para o app lançar no dia certo.
            </CardContent>
          </Card>
        )}

        {recurring.map((r) => (
          <Card
            key={r.id}
            className={!r.active ? "opacity-70" : undefined}
          >
            <CardContent className="flex flex-wrap items-center justify-between gap-3 py-4">
              <div className="min-w-0">
                <p className="font-semibold text-slate-900">{r.description}</p>
                <p className="text-sm text-slate-600">
                  {formatBRL(r.amount)} · todo dia {r.day_of_month} ·{" "}
                  {r.category}
                  {r.installments_total != null && r.installments_total > 0 && (
                    <span className="ml-1">
                      · {r.installments_generated ?? 0}/{r.installments_total}{" "}
                      parcelas
                    </span>
                  )}
                  {!r.active && (
                    <span className="ml-2 rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600">
                      Pausada
                    </span>
                  )}
                </p>
              </div>
              <div className="flex flex-wrap gap-1">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  title={r.active ? "Pausar" : "Reativar"}
                  onClick={() => updateRecurring(r.id, { active: !r.active })}
                >
                  {r.active ? (
                    <Pause className="h-4 w-4" />
                  ) : (
                    <Play className="h-4 w-4" />
                  )}
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  title="Editar"
                  onClick={() => startEdit(r)}
                >
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  title="Excluir"
                  onClick={() => {
                    if (
                      confirm(
                        `Excluir a despesa fixa “${r.description}”? Lançamentos já feitos no caixa permanecem.`
                      )
                    ) {
                      removeRecurring(r.id);
                    }
                  }}
                >
                  <Trash2 className="h-4 w-4 text-rose-600" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
