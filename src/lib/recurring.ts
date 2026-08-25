import type { RecurringExpense, Transaction } from "./types";

export function yearMonthKey(d: Date = new Date()): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

export function clampDayOfMonth(day: number): number {
  const n = Math.floor(Number(day) || 1);
  return Math.min(28, Math.max(1, n));
}

export function clampMonth(month: number): number {
  const n = Math.floor(Number(month) || 1);
  return Math.min(12, Math.max(1, n));
}

export function dueDateForMonth(year: number, month: number, day: number): string {
  const d = clampDayOfMonth(day);
  return `${year}-${String(month).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
}

/** Dia 1–28 a partir de uma data ISO YYYY-MM-DD */
export function dayFromIsoDate(iso: string): number {
  const parts = iso.split("-");
  const d = Number(parts[2]) || 1;
  return clampDayOfMonth(d);
}

/** Mês 1–12 a partir de ISO YYYY-MM-DD */
export function monthFromIsoDate(iso: string): number {
  const parts = iso.split("-");
  return clampMonth(Number(parts[1]) || 1);
}

function labelForRule(rule: RecurringExpense, generatedAfterThis: number): string {
  const freq = rule.frequency ?? "monthly";
  if (freq === "yearly") {
    return `${rule.description} (anual)`;
  }
  const total = rule.installments_total;
  if (total && total > 0) {
    return `${rule.description} (${generatedAfterThis}/${total})`;
  }
  return `${rule.description} (fixa)`;
}

/**
 * Gera despesas recorrentes devidas (idempotente).
 * - monthly: se hoje >= dia e ainda não há lançamento neste YM
 * - yearly: só no mês aniversário; valor cheio (não ÷12); 1× por ano
 * - parcelas: para quando installments_generated >= total
 * - se o utilizador apagou o lançamento do mês mas a regra continua ativa,
 *   regenera (sem incrementar de novo o contador de parcelas)
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

    const freq = rule.frequency ?? "monthly";
    const dueDay = clampDayOfMonth(rule.day_of_month);
    /** Já tínhamos gerado este YM — se o tx foi apagado, regeneramos sem +1 nas parcelas */
    const alreadyMarkedThisYm = rule.last_generated_ym === ym;

    if (freq === "yearly") {
      const annivMonth = clampMonth(rule.month_of_year ?? month);
      if (month !== annivMonth) continue;
      if (todayDay < dueDay) continue;

      const already = nextTx.some(
        (t) =>
          t.recurring_id === rule.id &&
          typeof t.date === "string" &&
          t.date.startsWith(`${year}-`)
      );
      if (already) {
        rule.last_generated_ym = ym;
        continue;
      }

      const date = dueDateForMonth(year, annivMonth, dueDay);
      const tx = buildTx(rule, date, 1);
      nextTx.unshift(tx);
      created.push(tx);
      rule.last_generated_ym = ym;
      if (!alreadyMarkedThisYm) {
        rule.installments_generated = (rule.installments_generated ?? 0) + 1;
      }
      rule.updated_at = new Date().toISOString();
      continue;
    }

    // --- monthly / parcelas ---
    const total = rule.installments_total ?? null;
    const generated = rule.installments_generated ?? 0;
    if (total != null && total > 0 && generated >= total) {
      rule.active = false;
      continue;
    }

    if (todayDay < dueDay) continue;

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

    // Regeneração do mesmo mês: mantém o nº de parcela; senão avança
    const nextCount = alreadyMarkedThisYm
      ? Math.max(1, generated)
      : generated + 1;
    const date = dueDateForMonth(year, month, dueDay);
    const tx = buildTx(rule, date, nextCount);
    nextTx.unshift(tx);
    created.push(tx);
    rule.last_generated_ym = ym;
    if (!alreadyMarkedThisYm) {
      rule.installments_generated = nextCount;
      if (total != null && total > 0 && nextCount >= total) {
        rule.active = false;
      }
    }
    rule.updated_at = new Date().toISOString();
  }

  return { transactions: nextTx, rules: nextRules, created };
}

function buildTx(
  rule: RecurringExpense,
  date: string,
  generatedAfterThis: number
): Transaction {
  return {
    id: crypto.randomUUID(),
    user_id: rule.user_id,
    date,
    amount: Number(rule.amount) || 0,
    type: "despesa",
    category: rule.category || "Software / Assinaturas",
    description: labelForRule(rule, generatedAfterThis),
    receipt_url: null,
    ai_confidence: null,
    is_deductible: rule.is_deductible,
    source: "recorrente",
    recurring_id: rule.id,
    created_at: new Date().toISOString(),
  };
}
