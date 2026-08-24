"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  addDemoRecurring,
  addDemoTransaction,
  applyRecurringGeneration,
  deleteDemoRecurring,
  deleteDemoTransaction,
  getDemoUserId,
  loadDemoRecurring,
  loadDemoSettings,
  loadDemoTransactions,
  saveDemoRecurring,
  saveDemoSettings,
  saveDemoTransactions,
  updateDemoRecurring,
  updateDemoTransaction,
} from "./demo-store";
import { filterByMonth, filterByYear, sumReceitas, summarizeMonth } from "./taxes";
import type { RecurringExpense, Transaction, UserSettings } from "./types";
import { isSupabaseConfigured, createClient } from "./supabase/client";
import { ensureUserSettings } from "./user-settings";
import { canAccessApp } from "./trial";
import {
  deleteRemoteRecurring,
  deleteRemoteTransaction,
  fetchRemoteRecurring,
  fetchRemoteTransactions,
  mergeById,
  upsertRemoteRecurring,
  upsertRemoteTransactions,
} from "./finance-sync";

export function useFinance(month?: { year: number; month: number }) {
  const now = new Date();
  const year = month?.year ?? now.getFullYear();
  const monthNum = month?.month ?? now.getMonth() + 1;

  const [userId, setUserId] = useState<string>(getDemoUserId());
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [recurring, setRecurring] = useState<RecurringExpense[]>([]);
  const [settings, setSettings] = useState<UserSettings | null>(null);
  const [ready, setReady] = useState(false);
  const [accessBlocked, setAccessBlocked] = useState(false);
  const [daysLeft, setDaysLeft] = useState<number | null>(null);
  const [syncError, setSyncError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    let uid = getDemoUserId();
    let remoteSettings: UserSettings | null = null;
    let supabase = null as ReturnType<typeof createClient> | null;
    let loggedIn = false;

    if (isSupabaseConfigured()) {
      try {
        supabase = createClient();
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (user) {
          uid = user.id;
          loggedIn = true;
          remoteSettings = await ensureUserSettings(supabase, user);
        }
      } catch (e) {
        console.error("[useFinance.auth]", e);
      }
    }

    setUserId(uid);

    if (remoteSettings) {
      setSettings(remoteSettings);
      saveDemoSettings(remoteSettings, uid);
      const access = canAccessApp(remoteSettings);
      setAccessBlocked(!access.ok);
      setDaysLeft(access.daysLeft ?? null);
    } else {
      const local = loadDemoSettings(uid);
      setSettings(local);
      const access = canAccessApp(local);
      if (isSupabaseConfigured()) {
        setAccessBlocked(!access.ok);
        setDaysLeft(access.daysLeft ?? null);
      } else {
        setAccessBlocked(false);
        setDaysLeft(access.daysLeft ?? null);
      }
    }

    let localTx = loadDemoTransactions(uid);
    let localRec = loadDemoRecurring(uid);

    // Sync celular ↔ PC quando há login
    if (loggedIn && supabase) {
      try {
        const [remoteTx, remoteRec] = await Promise.all([
          fetchRemoteTransactions(supabase, uid),
          fetchRemoteRecurring(supabase, uid),
        ]);

        const mergedTx = mergeById(localTx, remoteTx);
        const mergedRec = mergeById(localRec, remoteRec);

        // Envia o que só existia no aparelho
        await upsertRemoteTransactions(supabase, mergedTx);
        await upsertRemoteRecurring(supabase, mergedRec);

        // Fonte da verdade: remoto de novo
        localTx = await fetchRemoteTransactions(supabase, uid);
        localRec = await fetchRemoteRecurring(supabase, uid);

        saveDemoTransactions(localTx, uid);
        saveDemoRecurring(localRec, uid);
        setSyncError(null);
      } catch (e) {
        console.error("[useFinance.sync]", e);
        setSyncError(
          "Não foi possível sincronizar agora. Os dados deste aparelho continuam disponíveis."
        );
      }
    }

    // Gera despesas fixas devidas (local)
    applyRecurringGeneration(uid, new Date());
    localTx = loadDemoTransactions(uid);
    localRec = loadDemoRecurring(uid);

    // Se gerou algo novo, sobe para o Supabase
    if (loggedIn && supabase) {
      await upsertRemoteTransactions(supabase, localTx);
      await upsertRemoteRecurring(supabase, localRec);
      localTx = await fetchRemoteTransactions(supabase, uid);
      localRec = await fetchRemoteRecurring(supabase, uid);
      saveDemoTransactions(localTx, uid);
      saveDemoRecurring(localRec, uid);
    }

    setTransactions(localTx);
    setRecurring(localRec);
    setReady(true);
  }, []);

  useEffect(() => {
    void reload();
  }, [reload]);

  const monthTx = useMemo(
    () => filterByMonth(transactions, year, monthNum),
    [transactions, year, monthNum]
  );

  const yearTx = useMemo(
    () => filterByYear(transactions, year),
    [transactions, year]
  );

  const summary = useMemo(
    () =>
      summarizeMonth(monthTx, {
        regime: settings?.regime_tributario,
        atividade: settings?.atividade_mei,
        receitasAno: sumReceitas(yearTx),
      }),
    [monthTx, yearTx, settings]
  );

  const withRemoteTx = useCallback(
    async (tx: Transaction) => {
      if (!isSupabaseConfigured()) return;
      try {
        const supabase = createClient();
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (user) await upsertRemoteTransactions(supabase, [tx]);
      } catch (e) {
        console.error("[useFinance.remoteTx]", e);
      }
    },
    []
  );

  const withRemoteRec = useCallback(
    async (item: RecurringExpense) => {
      if (!isSupabaseConfigured()) return;
      try {
        const supabase = createClient();
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (user) await upsertRemoteRecurring(supabase, [item]);
      } catch (e) {
        console.error("[useFinance.remoteRec]", e);
      }
    },
    []
  );

  const addTransaction = useCallback(
    (partial: Omit<Transaction, "id" | "user_id" | "created_at">) => {
      const tx = addDemoTransaction(partial, userId);
      void withRemoteTx(tx).then(() => reload());
      return tx;
    },
    [reload, userId, withRemoteTx]
  );

  const updateTransaction = useCallback(
    (id: string, patch: Partial<Transaction>) => {
      const updated = updateDemoTransaction(id, patch, userId);
      if (updated) void withRemoteTx(updated).then(() => reload());
      else void reload();
    },
    [reload, userId, withRemoteTx]
  );

  const removeTransaction = useCallback(
    (id: string) => {
      deleteDemoTransaction(id, userId);
      void (async () => {
        if (isSupabaseConfigured()) {
          try {
            const supabase = createClient();
            const {
              data: { user },
            } = await supabase.auth.getUser();
            if (user) await deleteRemoteTransaction(supabase, id, user.id);
          } catch (e) {
            console.error("[useFinance.deleteTx]", e);
          }
        }
        await reload();
      })();
    },
    [reload, userId]
  );

  const addRecurring = useCallback(
    (
      partial: Omit<
        RecurringExpense,
        "id" | "user_id" | "created_at" | "last_generated_ym"
      > & {
        last_generated_ym?: string | null;
        installments_generated?: number;
      }
    ) => {
      const item = addDemoRecurring(partial, userId);
      void withRemoteRec(item).then(() => reload());
      return item;
    },
    [reload, userId, withRemoteRec]
  );

  const updateRecurring = useCallback(
    (id: string, patch: Partial<RecurringExpense>) => {
      const updated = updateDemoRecurring(id, patch, userId);
      if (updated) void withRemoteRec(updated).then(() => reload());
      else void reload();
    },
    [reload, userId, withRemoteRec]
  );

  const removeRecurring = useCallback(
    (id: string) => {
      deleteDemoRecurring(id, userId);
      void (async () => {
        if (isSupabaseConfigured()) {
          try {
            const supabase = createClient();
            const {
              data: { user },
            } = await supabase.auth.getUser();
            if (user) await deleteRemoteRecurring(supabase, id, user.id);
          } catch (e) {
            console.error("[useFinance.deleteRec]", e);
          }
        }
        await reload();
      })();
    },
    [reload, userId]
  );

  const updateSettings = useCallback(
    async (patch: Partial<UserSettings>) => {
      const current = settings || loadDemoSettings(userId);
      const next = { ...current, ...patch, user_id: userId };
      saveDemoSettings(next, userId);
      setSettings(next);

      if (isSupabaseConfigured()) {
        try {
          const supabase = createClient();
          const {
            data: { user },
          } = await supabase.auth.getUser();
          if (user) {
            await supabase
              .from("user_settings")
              .update({
                full_name: next.full_name,
                cnpj: next.cnpj,
                cidade: next.cidade,
                uf: next.uf,
                regime_tributario: next.regime_tributario,
                atividade_mei: next.atividade_mei,
                meta_mensal_lucro: next.meta_mensal_lucro,
                das_dia_vencimento: next.das_dia_vencimento,
                onboarding_done: next.onboarding_done,
              })
              .eq("user_id", user.id);
          }
        } catch (e) {
          console.error("[useFinance.updateSettings]", e);
        }
      }
    },
    [settings, userId]
  );

  return {
    ready,
    userId,
    transactions,
    recurring,
    monthTx,
    summary,
    settings,
    year,
    month: monthNum,
    accessBlocked,
    daysLeft,
    syncError,
    addTransaction,
    updateTransaction,
    removeTransaction,
    addRecurring,
    updateRecurring,
    removeRecurring,
    updateSettings,
    reload,
  };
}
