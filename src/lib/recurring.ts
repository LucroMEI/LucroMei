import type { RecurringExpense, Transaction } from "./types";

export function yearMonthKey(d: Date = new Date()): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

export function clampDayOfMonth(day: number): number {
  const n = Math.floor(Number(day) || 1);
  return Math.min(28, Math.max(1, n));
}

export function dueDateForMonth(year: number, month: number, day: number): string {
  const d = clampDayOfMonth(day);
  return `${year}-${String(month).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
}

function parcelLabel(rule: RecurringExpense, generatedAfterThis: number): string {
  const total = rule.installments_total;
  if (total && total > 0) {
    return `${rule.description} (${generatedAfterThis}/${total})`;
  }
  return `${rule.description} (fixa)`;
}

/**
 * Gera despesas fixas devidas no mês corrente (idempotente).
 * Regra: se hoje >= dia de vencimento e ainda não gerou neste YM, cria a transação.
 * Parcelas: para de gerar e desativa quando installments_generated >= installments_total.
 */
export function generateDueRecurring(
  rules: RecurringExpense[],
  existing: Transaction[],
  today: Date = new Date()
): {
  transactions: Transaction[];
  rules: RecurringExpense[];
  created: Transaction[];
} {
  const ym = yearMonthKey(today);
  const year = today.getFullYear();
  const month = today.getMonth() + 1;
  const todayDay = today.getDate();

  const created: Transaction[] = [];
  const nextRules = rules.map((r) => ({ ...r }));
  const nextTx = [...existing];

  for (const rule of nextRules) {
    if (!rule.active) continue;

    const total = rule.installments_total ?? null;
    const generated = rule.installments_generated ?? 0;
    if (total != null && total > 0 && generated >= total) {
      rule.active = false;
      continue;
    }

    const dueDay = clampDayOfMonth(rule.day_of_month);
    if (todayDay < dueDay) continue;
    if (rule.last_generated_ym === ym) continue;

    const already = nextTx.some(
      (t) =>
        t.recurring_id === rule.id &&
        typeof t.date === "string" &&
        t.date.startsWith(ym)
    );
    if (already) {
      rule.last_generated_ym = ym;
      continue;
    }

    const nextCount = generated + 1;
    const date = dueDateForMonth(year, month, dueDay);
    const tx: Transaction = {
      id: crypto.randomUUID(),
      user_id: rule.user_id,
      date,
      amount: Number(rule.amount) || 0,
      type: "despesa",
      category: rule.category || "Software / Assinaturas",
      description: parcelLabel(rule, nextCount),
      receipt_url: null,
      ai_confidence: null,
      is_deductible: rule.is_deductible,
      source: "recorrente",
      recurring_id: rule.id,
      created_at: new Date().toISOString(),
    };
    nextTx.unshift(tx);
    created.push(tx);
    rule.last_generated_ym = ym;
    rule.installments_generated = nextCount;
    rule.updated_at = new Date().toISOString();
    if (total != null && total > 0 && nextCount >= total) {
      rule.active = false;
    }
  }

  return { transactions: nextTx, rules: nextRules, created };
}

/** Dia 1–28 a partir de uma data ISO YYYY-MM-DD */
export function dayFromIsoDate(iso: string): number {
  const parts = iso.split("-");
  const d = Number(parts[2]) || 1;
  return clampDayOfMonth(d);
}
