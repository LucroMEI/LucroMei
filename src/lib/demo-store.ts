"use client";

import type { Transaction, UserSettings } from "./types";

const TX_KEY = "lucromei_tx_v1";
const SETTINGS_KEY = "lucromei_settings_v1";
const DEMO_USER = "demo-user";

function uid() {
  return crypto.randomUUID();
}

export function getDemoUserId() {
  return DEMO_USER;
}

export function loadDemoTransactions(): Transaction[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(TX_KEY);
    if (!raw) return seedDemoTransactions();
    return JSON.parse(raw) as Transaction[];
  } catch {
    return seedDemoTransactions();
  }
}

export function saveDemoTransactions(list: Transaction[]) {
  localStorage.setItem(TX_KEY, JSON.stringify(list));
}

export function addDemoTransaction(
  partial: Omit<Transaction, "id" | "user_id" | "created_at">
): Transaction {
  const list = loadDemoTransactions();
  const tx: Transaction = {
    ...partial,
    id: uid(),
    user_id: DEMO_USER,
    created_at: new Date().toISOString(),
  };
  list.unshift(tx);
  saveDemoTransactions(list);
  return tx;
}

export function updateDemoTransaction(id: string, patch: Partial<Transaction>) {
  const list = loadDemoTransactions().map((t) =>
    t.id === id ? { ...t, ...patch, updated_at: new Date().toISOString() } : t
  );
  saveDemoTransactions(list);
  return list.find((t) => t.id === id);
}

export function deleteDemoTransaction(id: string) {
  saveDemoTransactions(loadDemoTransactions().filter((t) => t.id !== id));
}

export function loadDemoSettings(): UserSettings {
  if (typeof window === "undefined") return defaultSettings();
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (!raw) {
      const s = defaultSettings();
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(s));
      return s;
    }
    return { ...defaultSettings(), ...JSON.parse(raw) };
  } catch {
    return defaultSettings();
  }
}

export function saveDemoSettings(s: UserSettings) {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(s));
}

function defaultSettings(): UserSettings {
  const trial = new Date();
  trial.setDate(trial.getDate() + 14);
  return {
    user_id: DEMO_USER,
    full_name: "MEI Demo",
    cnpj: null,
    cidade: "São Paulo",
    uf: "SP",
    regime_tributario: "MEI",
    atividade_mei: "servicos",
    meta_mensal_lucro: 4000,
    das_dia_vencimento: 20,
    onboarding_done: false,
    trial_ends_at: trial.toISOString(),
    stripe_customer_id: null,
    stripe_subscription_id: null,
    subscription_status: "trialing",
    plan: "trial",
  };
}

function seedDemoTransactions(): Transaction[] {
  const today = new Date();
  const y = today.getFullYear();
  const m = String(today.getMonth() + 1).padStart(2, "0");
  const d = (day: number) =>
    `${y}-${m}-${String(Math.min(day, 28)).padStart(2, "0")}`;

  const seed: Transaction[] = [
    {
      id: uid(),
      user_id: DEMO_USER,
      date: d(3),
      amount: 1200,
      type: "receita",
      category: "Vendas / Serviços",
      description: "Projeto de design — cliente Ana",
      receipt_url: null,
      ai_confidence: null,
      is_deductible: false,
      source: "manual",
    },
    {
      id: uid(),
      user_id: DEMO_USER,
      date: d(5),
      amount: 89.9,
      type: "despesa",
      category: "Software / Assinaturas",
      description: "Canva Pro",
      receipt_url: null,
      ai_confidence: 0.92,
      is_deductible: true,
      source: "upload",
    },
    {
      id: uid(),
      user_id: DEMO_USER,
      date: d(8),
      amount: 450,
      type: "receita",
      category: "Recebimentos PIX",
      description: "Consulta freela",
      receipt_url: null,
      ai_confidence: null,
      is_deductible: false,
      source: "manual",
    },
    {
      id: uid(),
      user_id: DEMO_USER,
      date: d(10),
      amount: 67.5,
      type: "despesa",
      category: "Combustível / Transporte",
      description: "Uber — reunião cliente",
      receipt_url: null,
      ai_confidence: 0.88,
      is_deductible: true,
      source: "upload",
    },
    {
      id: uid(),
      user_id: DEMO_USER,
      date: d(12),
      amount: 80.9,
      type: "despesa",
      category: "Impostos / DAS",
      description: "DAS MEI do mês",
      receipt_url: null,
      ai_confidence: null,
      is_deductible: false,
      source: "manual",
    },
    {
      id: uid(),
      user_id: DEMO_USER,
      date: d(15),
      amount: 220,
      type: "despesa",
      category: "Material / Insumos",
      description: "Materiais para entrega",
      receipt_url: null,
      ai_confidence: 0.75,
      is_deductible: true,
      source: "upload",
    },
  ];
  if (typeof window !== "undefined") {
    localStorage.setItem(TX_KEY, JSON.stringify(seed));
  }
  return seed;
}

export function clearDemoData() {
  localStorage.removeItem(TX_KEY);
  localStorage.removeItem(SETTINGS_KEY);
}
