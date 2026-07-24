import { createAdminClient, isAdminConfigured } from "@/lib/supabase/admin";

/** Limite real de vagas Early Bird (servidor). Nunca expor o número no UI. */
export const EARLYBIRD_LIMIT = 100;

export const EARLYBIRD_MARKETING = {
  /** Texto do card enquanto ainda há vagas (sem número) */
  blurbAvailable: "Preço de lançamento · faltam poucas vagas",
  /** Texto quando esgotado */
  blurbSoldOut: "Vagas de lançamento esgotadas",
  badgeAvailable: "Lançamento",
  badgeSoldOut: "Esgotado",
  checkoutBlocked:
    "As vagas do Early Bird esgotaram. Escolha o plano Mensal ou Anual.",
} as const;

/**
 * Conta assinantes Early Bird ativos (só servidor / service role).
 * Em falha de config, devolve 0 (não bloqueia por engano de infra).
 */
export async function countActiveEarlybird(): Promise<number> {
  if (!isAdminConfigured()) {
    console.warn("[earlybird] service role ausente — contagem = 0");
    return 0;
  }
  const admin = createAdminClient();
  const { count, error } = await admin
    .from("user_settings")
    .select("user_id", { count: "exact", head: true })
    .eq("plan", "earlybird")
    .eq("subscription_status", "active");

  if (error) {
    console.error("[earlybird] count", error.message);
    return 0;
  }
  return count ?? 0;
}

export async function isEarlybirdAvailable(): Promise<boolean> {
  const n = await countActiveEarlybird();
  return n < EARLYBIRD_LIMIT;
}
