"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Pause, Play, Plus, Trash2, Pencil, Repeat } from "lucide-react";
import { useFinance } from "@/lib/use-finance";
import { formatBRL } from "@/lib/format";
import { DEFAULT_CATEGORIES, isDeductibleDefault } from "@/lib/categories";
import { clampDayOfMonth, clampMonth } from "@/lib/recurring";
import type { RecurringExpense, RecurringFrequency } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input, Label, Select } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const emptyForm = {
  description: "",
  amount: "",
  day_of_month: "1",
  month_of_year: String(new Date().getMonth() + 1),
  frequency: "monthly" as RecurringFrequency,
  category: "Software / Assinaturas",
  is_deductible: true,
  active: true,
  /** "" = assinatura contínua; número = parcelas no cartão */
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

  function startEdit(r: RecurringExpense) {
    setEditingId(r.id);
    setForm({
      description: r.description,
      amount: String(r.amount).replace(".", ","),
      day_of_month: String(r.day_of_month),
      month_of_year: String(r.month_of_year ?? new Date().getMonth() + 1),
      frequency: r.frequency ?? "monthly",
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
    const parcels =
      form.frequency === "monthly" && parcelsRaw
        ? Math.min(48, Math.max(2, Math.floor(Number(parcelsRaw) || 0)))
        : null;

    const payload = {
      description: form.description.trim(),
      amount,
      day_of_month: clampDayOfMonth(Number(form.day_of_month)),
      month_of_year:
        form.frequency === "yearly"
          ? clampMonth(Number(form.month_of_year))
          : null,
      frequency: form.frequency,
      category: form.category,
      is_deductible: form.is_deductible,
      active: form.active,
      installments_total:
        form.frequency === "monthly" && parcels && parcels >= 2
          ? parcels
          : null,
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
            Mensal, parcelas no cartão ou anual (valor cheio no mês do
            pagamento — para o lucro e o CSV do contador). Também no
            comprovante, ao salvar.
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
              <div>
                <Label htmlFor="freq">Frequência</Label>
                <Select
                  id="freq"
                  value={form.frequency}
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      frequency: e.target.value as RecurringFrequency,
                      installments_total:
                        e.target.value === "yearly" ? "" : f.installments_total,
                    }))
                  }
                >
                  <option value="monthly">Todo mês (ou parcelas)</option>
                  <option value="yearly">Todo ano (valor cheio)</option>
                </Select>
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
                  <Label htmlFor="day">Dia</Label>
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
              {form.frequency === "yearly" && (
                <div>
                  <Label htmlFor="moy">Mês do pagamento</Label>
                  <Select
                    id="moy"
                    value={form.month_of_year}
                    onChange={(e) =>
                      setForm((f) => ({
                        ...f,
                        month_of_year: e.target.value,
                      }))
                    }
                  >
                    {[
                      "Janeiro",
                      "Fevereiro",
                      "Março",
                      "Abril",
                      "Maio",
                      "Junho",
                      "Julho",
                      "Agosto",
                      "Setembro",
                      "Outubro",
                      "Novembro",
                      "Dezembro",
                    ].map((name, i) => (
                      <option key={name} value={String(i + 1)}>
                        {name}
                      </option>
                    ))}
                  </Select>
                </div>
              )}
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
              {form.frequency === "monthly" && (
                <div>
                  <Label htmlFor="parcels">Número de parcelas (cartão)</Label>
                  <Input
                    id="parcels"
                    type="number"
                    min={2}
                    max={48}
                    placeholder="Vazio = todo mês até pausar"
                    value={form.installments_total}
                    onChange={(e) =>
                      setForm((f) => ({
                        ...f,
                        installments_total: e.target.value,
                      }))
                    }
                  />
                </div>
              )}
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
                <span>
                  <span className="font-medium text-slate-800">
                    Gasto do negócio (MEI)
                  </span>
                  <span className="mt-0.5 block text-xs font-normal text-slate-500">
                    Desmarque se for despesa pessoal
                  </span>
                </span>
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
