"use client";

import type { Transaction, UserSettings } from "./types";
import { defaultTrialEndsAt } from "./trial";

const DEMO_USER = "demo-user";

function txKey(userId: string) {
  return `lucromei_tx_v1_${userId}`;
}
function settingsKey(userId: string) {
  return `lucromei_settings_v1_${userId}`;
}

function uid() {
  return crypto.randomUUID();
}

export function getDemoUserId() {
  return DEMO_USER;
}

export function loadDemoTransactions(userId: string = DEMO_USER): Transaction[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(txKey(userId));
    if (!raw) {
      // Migração da chave antiga global (só demo)
      if (userId === DEMO_USER) {
        const legacy = localStorage.getItem("lucromei_tx_v1");
        if (legacy) {
          localStorage.setItem(txKey(userId), legacy);
          return JSON.parse(legacy) as Transaction[];
        }
      }
      return userId === DEMO_USER ? seedDemoTransactions(userId) : [];
    }
    return JSON.parse(raw) as Transaction[];
  } catch {
    return userId === DEMO_USER ? seedDemoTransactions(userId) : [];
  }
}

export function saveDemoTransactions(list: Transaction[], userId: string = DEMO_USER) {
  localStorage.setItem(txKey(userId), JSON.stringify(list));
}

export function addDemoTransaction(
  partial: Omit<Transaction, "id" | "user_id" | "created_at">,
  userId: string = DEMO_USER
): Transaction {
  const list = loadDemoTransactions(userId);
  const tx: Transaction = {
    ...partial,
    id: uid(),
    user_id: userId,
    created_at: new Date().toISOString(),
  };
  list.unshift(tx);
  saveDemoTransactions(list, userId);
  return tx;
}

export function updateDemoTransaction(
  id: string,
  patch: Partial<Transaction>,
  userId: string = DEMO_USER
) {
  const list = loadDemoTransactions(userId).map((t) =>
    t.id === id ? { ...t, ...patch, updated_at: new Date().toISOString() } : t
  );
  saveDemoTransactions(list, userId);
  return list.find((t) => t.id === id);
}

export function deleteDemoTransaction(id: string, userId: string = DEMO_USER) {
  saveDemoTransactions(
    loadDemoTransactions(userId).filter((t) => t.id !== id),
    userId
  );
}

export function loadDemoSettings(userId: string = DEMO_USER): UserSettings {
  if (typeof window === "undefined") return defaultSettings(userId);
  try {
    const raw = localStorage.getItem(settingsKey(userId));
    if (!raw) {
      if (userId === DEMO_USER) {
        const legacy = localStorage.getItem("lucromei_settings_v1");
        if (legacy) {
          localStorage.setItem(settingsKey(userId), legacy);
          return { ...defaultSettings(userId), ...JSON.parse(legacy) };
        }
      }
      const s = defaultSettings(userId);
      localStorage.setItem(settingsKey(userId), JSON.stringify(s));
      return s;
    }
    return { ...defaultSettings(userId), ...JSON.parse(raw) };
  } catch {
    return defaultSettings(userId);
  }
}

export function saveDemoSettings(s: UserSettings, userId?: string) {
  const id = userId || s.user_id || DEMO_USER;
  localStorage.setItem(settingsKey(id), JSON.stringify(s));
}

function defaultSettings(userId: string): UserSettings {
  return {
    user_id: userId,
    full_name: userId === DEMO_USER ? "MEI Demo" : "Utilizador",
    cnpj: null,
    cidade: "São Paulo",
    uf: "SP",
    regime_tributario: "MEI",
    atividade_mei: "servicos",
    meta_mensal_lucro: 4000,
    das_dia_vencimento: 20,
    onboarding_done: false,
    trial_ends_at: defaultTrialEndsAt(),
    stripe_customer_id: null,
    stripe_subscription_id: null,
    subscription_status: "trialing",
    plan: "trial",
  };
}

function seedDemoTransactions(userId: string): Transaction[] {
  const today = new Date();
  const y = today.getFullYear();
  const m = String(today.getMonth() + 1).padStart(2, "0");
  const d = (day: number) =>
    `${y}-${m}-${String(Math.min(day, 28)).padStart(2, "0")}`;

  const seed: Transaction[] = [
    {
      id: uid(),
      user_id: userId,
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
      user_id: userId,
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
      user_id: userId,
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
  ];
  if (typeof window !== "undefined") {
    saveDemoTransactions(seed, userId);
  }
  return seed;
}

export function clearDemoData(userId: string = DEMO_USER) {
  localStorage.removeItem(txKey(userId));
  localStorage.removeItem(settingsKey(userId));
}
