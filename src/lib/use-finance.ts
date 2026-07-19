"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  addDemoTransaction,
  deleteDemoTransaction,
  getDemoUserId,
  loadDemoSettings,
  loadDemoTransactions,
  saveDemoSettings,
  updateDemoTransaction,
} from "./demo-store";
import { filterByMonth, filterByYear, sumReceitas, summarizeMonth } from "./taxes";
import type { Transaction, UserSettings } from "./types";
import { isSupabaseConfigured, createClient } from "./supabase/client";
import { ensureUserSettings } from "./user-settings";
import { canAccessApp } from "./trial";

export function useFinance(month?: { year: number; month: number }) {
  const now = new Date();
  const year = month?.year ?? now.getFullYear();
  const monthNum = month?.month ?? now.getMonth() + 1;

  const [userId, setUserId] = useState<string>(getDemoUserId());
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [settings, setSettings] = useState<UserSettings | null>(null);
  const [ready, setReady] = useState(false);
  const [accessBlocked, setAccessBlocked] = useState(false);
  const [daysLeft, setDaysLeft] = useState<number | null>(null);

  const reload = useCallback(async () => {
    let uid = getDemoUserId();
    let remoteSettings: UserSettings | null = null;

    if (isSupabaseConfigured()) {
      try {
        const supabase = createClient();
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (user) {
          uid = user.id;
          remoteSettings = await ensureUserSettings(supabase, user);
        }
      } catch (e) {
        console.error("[useFinance.auth]", e);
      }
    }

    setUserId(uid);

    if (remoteSettings) {
      setSettings(remoteSettings);
      // Espelha settings no local para config offline
      saveDemoSettings(remoteSettings, uid);
      const access = canAccessApp(remoteSettings);
      setAccessBlocked(!access.ok);
      setDaysLeft(access.daysLeft ?? null);
    } else {
      const local = loadDemoSettings(uid);
      setSettings(local);
      const access = canAccessApp(local);
      // Em demo sem Supabase, não bloqueia por trial (dev)
      if (isSupabaseConfigured()) {
        setAccessBlocked(!access.ok);
        setDaysLeft(access.daysLeft ?? null);
      } else {
        setAccessBlocked(false);
        setDaysLeft(access.daysLeft ?? null);
      }
    }

    setTransactions(loadDemoTransactions(uid));
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

  const addTransaction = useCallback(
    (partial: Omit<Transaction, "id" | "user_id" | "created_at">) => {
      const tx = addDemoTransaction(partial, userId);
      void reload();
      return tx;
    },
    [reload, userId]
  );

  const updateTransaction = useCallback(
    (id: string, patch: Partial<Transaction>) => {
      updateDemoTransaction(id, patch, userId);
      void reload();
    },
    [reload, userId]
  );

  const removeTransaction = useCallback(
    (id: string) => {
      deleteDemoTransaction(id, userId);
      void reload();
    },
    [reload, userId]
  );

  const updateSettings = useCallback(
    async (patch: Partial<UserSettings>) => {
      const current =
        settings || loadDemoSettings(userId);
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
    monthTx,
    summary,
    settings,
    year,
    month: monthNum,
    accessBlocked,
    daysLeft,
    addTransaction,
    updateTransaction,
    removeTransaction,
    updateSettings,
    reload,
  };
}
