import type { SupabaseClient, User } from "@supabase/supabase-js";
import type { UserSettings } from "./types";
import { defaultTrialEndsAt } from "./trial";

const SETTINGS_SELECT =
  "user_id, full_name, cnpj, cidade, uf, regime_tributario, atividade_mei, meta_mensal_lucro, das_dia_vencimento, onboarding_done, trial_ends_at, stripe_customer_id, stripe_subscription_id, subscription_status, plan";

export async function fetchUserSettings(
  supabase: SupabaseClient,
  userId: string
): Promise<UserSettings | null> {
  const { data, error } = await supabase
    .from("user_settings")
    .select(SETTINGS_SELECT)
    .eq("user_id", userId)
    .maybeSingle();

  if (error) {
    console.error("[user_settings.fetch]", error.message);
    return null;
  }
  return data as UserSettings | null;
}

/** Garante linha em user_settings com trial de 14 dias (se ainda não existir). */
export async function ensureUserSettings(
  supabase: SupabaseClient,
  user: User
): Promise<UserSettings | null> {
  const existing = await fetchUserSettings(supabase, user.id);
  if (existing) {
    // Se por algum motivo não tem trial nem pago, cria trial agora
    if (!existing.trial_ends_at && existing.subscription_status !== "active") {
      const trial_ends_at = defaultTrialEndsAt();
      const { data, error } = await supabase
        .from("user_settings")
        .update({
          trial_ends_at,
          subscription_status: "trialing",
          plan: "trial",
        })
        .eq("user_id", user.id)
        .select(SETTINGS_SELECT)
        .single();
      if (error) {
        console.error("[user_settings.fix_trial]", error.message);
        return { ...existing, trial_ends_at, subscription_status: "trialing", plan: "trial" };
      }
      return data as UserSettings;
    }
    return existing;
  }

  const row = {
    user_id: user.id,
    full_name:
      (user.user_metadata?.full_name as string | undefined) ||
      user.email?.split("@")[0] ||
      "Utilizador",
    trial_ends_at: defaultTrialEndsAt(),
    subscription_status: "trialing" as const,
    plan: "trial" as const,
    regime_tributario: "MEI" as const,
    atividade_mei: "servicos" as const,
    uf: "SP",
    meta_mensal_lucro: 4000,
    das_dia_vencimento: 20,
    onboarding_done: false,
  };

  const { data, error } = await supabase
    .from("user_settings")
    .upsert(row, { onConflict: "user_id" })
    .select(SETTINGS_SELECT)
    .single();

  if (error) {
    console.error("[user_settings.ensure]", error.message);
    // Fallback local shape se a tabela ainda não existir
    return {
      user_id: user.id,
      full_name: row.full_name,
      cnpj: null,
      cidade: null,
      uf: "SP",
      regime_tributario: "MEI",
      atividade_mei: "servicos",
      meta_mensal_lucro: 4000,
      das_dia_vencimento: 20,
      onboarding_done: false,
      trial_ends_at: row.trial_ends_at,
      stripe_customer_id: null,
      stripe_subscription_id: null,
      subscription_status: "trialing",
      plan: "trial",
    };
  }

  return data as UserSettings;
}
