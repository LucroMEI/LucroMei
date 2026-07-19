import type { UserSettings } from "./types";

export type AccessResult = {
  ok: boolean;
  reason?: "no_settings" | "trial_ended" | "no_trial";
  daysLeft?: number;
  trialEndsAt?: string | null;
};

/** Assinatura paga (Stripe ligado depois). Por agora quase sempre false. */
export function hasPaidAccess(settings: Pick<UserSettings, "subscription_status" | "plan"> | null): boolean {
  if (!settings) return false;
  if (settings.subscription_status === "active") return true;
  return ["monthly", "yearly", "earlybird"].includes(settings.plan);
}

/** Pode usar o app? Trial ativo OU plano pago. */
export function canAccessApp(
  settings: Pick<UserSettings, "trial_ends_at" | "subscription_status" | "plan"> | null
): AccessResult {
  if (!settings) {
    return { ok: false, reason: "no_settings" };
  }
  if (hasPaidAccess(settings)) {
    return { ok: true, trialEndsAt: settings.trial_ends_at };
  }

  if (!settings.trial_ends_at) {
    return { ok: false, reason: "no_trial", trialEndsAt: null };
  }

  const end = new Date(settings.trial_ends_at);
  const now = new Date();
  if (Number.isNaN(end.getTime())) {
    return { ok: false, reason: "no_trial", trialEndsAt: settings.trial_ends_at };
  }

  if (now.getTime() <= end.getTime()) {
    const daysLeft = Math.max(
      0,
      Math.ceil((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
    );
    return { ok: true, daysLeft, trialEndsAt: settings.trial_ends_at };
  }

  return { ok: false, reason: "trial_ended", trialEndsAt: settings.trial_ends_at };
}

export function trialEndsInDays(trialEndsAt: string | null | undefined): number | null {
  if (!trialEndsAt) return null;
  const end = new Date(trialEndsAt);
  if (Number.isNaN(end.getTime())) return null;
  return Math.ceil((end.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
}

export function defaultTrialEndsAt(from = new Date()): string {
  const d = new Date(from);
  d.setDate(d.getDate() + 14);
  return d.toISOString();
}
