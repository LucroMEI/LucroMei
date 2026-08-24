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

/**
 * Gera despesas fixas devidas no mês corrente (idempotente).
 * Regra: se hoje >= dia de vencimento e ainda não gerou neste YM, cria a transação.
 * Se o utilizador apagar a despesa, last_generated_ym impede regenerar no mesmo mês.
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

    const date = dueDateForMonth(year, month, dueDay);
    const tx: Transaction = {
      id: crypto.randomUUID(),
      user_id: rule.user_id,
      date,
      amount: Number(rule.amount) || 0,
      type: "despesa",
      category: rule.category || "Software / Assinaturas",
      description: `${rule.description} (fixa)`,
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
    rule.updated_at = new Date().toISOString();
  }

  return { transactions: nextTx, rules: nextRules, created };
}
