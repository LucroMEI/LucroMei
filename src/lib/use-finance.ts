"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  addDemoTransaction,
  deleteDemoTransaction,
  loadDemoSettings,
  loadDemoTransactions,
  saveDemoSettings,
  updateDemoTransaction,
} from "./demo-store";
import { filterByMonth, filterByYear, sumReceitas, summarizeMonth } from "./taxes";
import type { Transaction, UserSettings } from "./types";

export function useFinance(month?: { year: number; month: number }) {
  const now = new Date();
  const year = month?.year ?? now.getFullYear();
  const monthNum = month?.month ?? now.getMonth() + 1;

  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [settings, setSettings] = useState<UserSettings | null>(null);
  const [ready, setReady] = useState(false);

  const reload = useCallback(() => {
    setTransactions(loadDemoTransactions());
    setSettings(loadDemoSettings());
    setReady(true);
  }, []);

  useEffect(() => {
    reload();
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
      const tx = addDemoTransaction(partial);
      reload();
      return tx;
    },
    [reload]
  );

  const updateTransaction = useCallback(
    (id: string, patch: Partial<Transaction>) => {
      updateDemoTransaction(id, patch);
      reload();
    },
    [reload]
  );

  const removeTransaction = useCallback(
    (id: string) => {
      deleteDemoTransaction(id);
      reload();
    },
    [reload]
  );

  const updateSettings = useCallback(
    (patch: Partial<UserSettings>) => {
      const current = loadDemoSettings();
      const next = { ...current, ...patch };
      saveDemoSettings(next);
      setSettings(next);
    },
    []
  );

  return {
    ready,
    transactions,
    monthTx,
    summary,
    settings,
    year,
    month: monthNum,
    addTransaction,
    updateTransaction,
    removeTransaction,
    updateSettings,
    reload,
  };
}
