import type { SupabaseClient } from "@supabase/supabase-js";
import type { RecurringExpense, Transaction } from "./types";

const TX_COLS =
  "id, user_id, date, amount, type, category, description, receipt_url, receipt_path, ai_confidence, is_deductible, notes, source, recurring_id, created_at, updated_at";

const REC_COLS =
  "id, user_id, description, amount, day_of_month, category, is_deductible, active, last_generated_ym, frequency, month_of_year, installments_total, installments_generated, created_at, updated_at";

function scrubReceiptUrl(url: string | null | undefined): string | null {
  if (!url) return null;
  // blob: e data: não servem noutro aparelho
  if (url.startsWith("blob:") || url.startsWith("data:")) return null;
  return url;
}

function txToRow(tx: Transaction) {
  return {
    id: tx.id,
    user_id: tx.user_id,
    date: tx.date,
    amount: tx.amount,
    type: tx.type,
    category: tx.category,
    description: tx.description,
    receipt_url: scrubReceiptUrl(tx.receipt_url),
    receipt_path: tx.receipt_path ?? null,
    ai_confidence: tx.ai_confidence,
    is_deductible: tx.is_deductible,
    notes: tx.notes ?? null,
    source: tx.source ?? "manual",
    recurring_id: tx.recurring_id ?? null,
    updated_at: new Date().toISOString(),
  };
}

function rowToTx(row: Record<string, unknown>): Transaction {
  return {
    id: String(row.id),
    user_id: String(row.user_id),
    date: String(row.date).slice(0, 10),
    amount: Number(row.amount) || 0,
    type: row.type === "receita" ? "receita" : "despesa",
    category: String(row.category || "Outras despesas"),
    description: (row.description as string) ?? null,
    receipt_url: (row.receipt_url as string) ?? null,
    receipt_path: (row.receipt_path as string) ?? null,
    ai_confidence:
      row.ai_confidence == null ? null : Number(row.ai_confidence),
    is_deductible: Boolean(row.is_deductible),
    notes: (row.notes as string) ?? null,
    source: (row.source as Transaction["source"]) || "manual",
    recurring_id: (row.recurring_id as string) ?? null,
    created_at: row.created_at as string | undefined,
    updated_at: row.updated_at as string | undefined,
  };
}

function recToRow(r: RecurringExpense) {
  return {
    id: r.id,
    user_id: r.user_id,
    description: r.description,
    amount: r.amount,
    day_of_month: r.day_of_month,
    category: r.category,
    is_deductible: r.is_deductible,
    active: r.active,
    last_generated_ym: r.last_generated_ym,
    frequency: r.frequency ?? "monthly",
    month_of_year: r.month_of_year ?? null,
    installments_total: r.installments_total ?? null,
    installments_generated: r.installments_generated ?? 0,
    updated_at: new Date().toISOString(),
  };
}

function rowToRec(row: Record<string, unknown>): RecurringExpense {
  return {
    id: String(row.id),
    user_id: String(row.user_id),
    description: String(row.description || ""),
    amount: Number(row.amount) || 0,
    day_of_month: Number(row.day_of_month) || 1,
    category: String(row.category || "Software / Assinaturas"),
    is_deductible: row.is_deductible !== false,
    active: row.active !== false,
    last_generated_ym: (row.last_generated_ym as string) ?? null,
    frequency: row.frequency === "yearly" ? "yearly" : "monthly",
    month_of_year:
      row.month_of_year == null ? null : Number(row.month_of_year),
    installments_total:
      row.installments_total == null ? null : Number(row.installments_total),
    installments_generated: Number(row.installments_generated) || 0,
    created_at: row.created_at as string | undefined,
    updated_at: row.updated_at as string | undefined,
  };
}

export async function fetchRemoteTransactions(
  supabase: SupabaseClient,
  userId: string
): Promise<Transaction[]> {
  const { data, error } = await supabase
    .from("transactions")
    .select(TX_COLS)
    .eq("user_id", userId)
    .order("date", { ascending: false });
  if (error) {
    console.error("[finance-sync.fetchTx]", error.message);
    return [];
  }
  return (data || []).map((r) => rowToTx(r as Record<string, unknown>));
}

export async function fetchRemoteRecurring(
  supabase: SupabaseClient,
  userId: string
): Promise<RecurringExpense[]> {
  const { data, error } = await supabase
    .from("recurring_expenses")
    .select(REC_COLS)
    .eq("user_id", userId)
    .order("created_at", { ascending: false });
  if (error) {
    console.error("[finance-sync.fetchRec]", error.message);
    return [];
  }
  return (data || []).map((r) => rowToRec(r as Record<string, unknown>));
}

export async function upsertRemoteTransactions(
  supabase: SupabaseClient,
  txs: Transaction[]
): Promise<boolean> {
  if (txs.length === 0) return true;
  const rows = txs.map(txToRow);
  const { error } = await supabase.from("transactions").upsert(rows, {
    onConflict: "id",
  });
  if (error) {
    console.error("[finance-sync.upsertTx]", error.message);
    return false;
  }
  return true;
}

export async function upsertRemoteRecurring(
  supabase: SupabaseClient,
  items: RecurringExpense[]
): Promise<boolean> {
  if (items.length === 0) return true;
  const rows = items.map(recToRow);
  const { error } = await supabase.from("recurring_expenses").upsert(rows, {
    onConflict: "id",
  });
  if (error) {
    console.error("[finance-sync.upsertRec]", error.message);
    return false;
  }
  return true;
}

export async function deleteRemoteTransaction(
  supabase: SupabaseClient,
  id: string,
  userId: string
): Promise<boolean> {
  const { error } = await supabase
    .from("transactions")
    .delete()
    .eq("id", id)
    .eq("user_id", userId);
  if (error) {
    console.error("[finance-sync.deleteTx]", error.message);
    return false;
  }
  return true;
}

export async function deleteRemoteRecurring(
  supabase: SupabaseClient,
  id: string,
  userId: string
): Promise<boolean> {
  const { error } = await supabase
    .from("recurring_expenses")
    .delete()
    .eq("id", id)
    .eq("user_id", userId);
  if (error) {
    console.error("[finance-sync.deleteRec]", error.message);
    return false;
  }
  return true;
}

/**
 * Junta local + remoto por id (remote ganha se updated_at mais recente).
 */
export function mergeById<T extends { id: string; updated_at?: string; created_at?: string }>(
  local: T[],
  remote: T[]
): T[] {
  const map = new Map<string, T>();
  for (const item of remote) map.set(item.id, item);
  for (const item of local) {
    const prev = map.get(item.id);
    if (!prev) {
      map.set(item.id, item);
      continue;
    }
    const a = item.updated_at || item.created_at || "";
    const b = prev.updated_at || prev.created_at || "";
    if (a >= b) map.set(item.id, item);
  }
  return [...map.values()];
}
