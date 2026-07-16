export type TransactionType = "receita" | "despesa";
export type RegimeTributario = "MEI" | "Simples" | "Autonomo" | "Outro";
export type AtividadeMei = "comercio" | "servicos" | "comercio_servicos";
export type SubscriptionStatus =
  | "trialing"
  | "active"
  | "past_due"
  | "canceled"
  | "incomplete"
  | "none";
export type Plan = "trial" | "monthly" | "yearly" | "earlybird" | "none";

export interface Transaction {
  id: string;
  user_id: string;
  date: string;
  amount: number;
  type: TransactionType;
  category: string;
  description: string | null;
  receipt_url: string | null;
  receipt_path?: string | null;
  ai_confidence: number | null;
  is_deductible: boolean;
  notes?: string | null;
  source?: "manual" | "upload" | "import";
  created_at?: string;
  updated_at?: string;
}

export interface UserSettings {
  user_id: string;
  full_name: string | null;
  cnpj: string | null;
  cidade: string | null;
  uf: string;
  regime_tributario: RegimeTributario;
  atividade_mei: AtividadeMei;
  meta_mensal_lucro: number;
  das_dia_vencimento: number;
  onboarding_done: boolean;
  trial_ends_at: string | null;
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
  subscription_status: SubscriptionStatus;
  plan: Plan;
}

export interface Category {
  id: string;
  user_id: string | null;
  name: string;
  type: "receita" | "despesa" | "ambos";
  icon: string;
  is_system: boolean;
  is_deductible_default: boolean;
}

export interface Alert {
  id: string;
  user_id: string;
  kind: "das" | "meta" | "limite_mei" | "sistema";
  title: string;
  message: string;
  due_date: string | null;
  is_read: boolean;
  is_dismissed: boolean;
}

export interface AiReceiptResult {
  amount: number | null;
  date: string | null;
  type: TransactionType;
  category: string;
  description: string;
  is_deductible: boolean;
  confidence: number;
  merchant?: string;
  raw_text?: string;
  /** "mock" = sem IA real (só nome do ficheiro); "ai" = Grok Vision */
  source?: "mock" | "ai";
  message?: string;
}

export interface MonthSummary {
  receitas: number;
  despesas: number;
  despesasDedutiveis: number;
  lucro: number;
  impostoEstimado: number;
  dasEstimado: number;
  irEstimado: number;
  /** Proxy Simples Nacional no mês (0 se não for regime Simples) */
  simplesEstimado: number;
  /** Base usada no IR: receitas − despesas dedutíveis */
  baseIr: number;
  count: number;
  regime: RegimeTributario;
  atividade: AtividadeMei;
  /** Explicação curta do método de estimativa */
  metodo: string;
  lines: { key: string; label: string; value: number; note?: string }[];
  receitasAno: number;
  limiteMei: number;
  pctLimiteMei: number;
  pertoLimiteMei: boolean;
  acimaLimiteMei: boolean;
  alerta: string | null;
  lucroAposImposto: number;
}
