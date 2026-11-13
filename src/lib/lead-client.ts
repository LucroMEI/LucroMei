"use client";

export type LeadKind = "cadastro" | "primeiro_comprovante";

function gtag(...args: unknown[]) {
  const w = window as unknown as { gtag?: (...a: unknown[]) => void };
  if (typeof w.gtag === "function") {
    w.gtag(...args);
  }
}

/** Marca o lead no Analytics e avisa o e-mail da Sandra. Não bloqueia a tela. */
export function trackLead(kind: LeadKind, accessToken?: string) {
  try {
    if (kind === "cadastro") {
      gtag("event", "sign_up", { method: "email" });
    } else {
      gtag("event", "primeiro_comprovante");
    }
  } catch {
    /* ignore */
  }

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  if (accessToken) {
    headers.Authorization = `Bearer ${accessToken}`;
  }

  try {
    fetch("/api/leads/notify", {
      method: "POST",
      headers,
      body: JSON.stringify({ kind }),
      keepalive: true,
    }).catch(() => {});
  } catch {
    /* ignore */
  }
}
