"use client";

export type LeadKind = "cadastro" | "primeiro_comprovante";

function gtag(...args: unknown[]) {
  const w = window as unknown as { gtag?: (...a: unknown[]) => void };
  if (typeof w.gtag === "function") {
    w.gtag(...args);
  }
}

/** Marca o lead no Analytics e avisa o e-mail da Sandra. Espera até 2s o aviso. */
export function trackLead(
  kind: LeadKind,
  accessToken?: string,
  method: "email" | "google" = "email"
): Promise<void> {
  try {
    if (kind === "cadastro") {
      gtag("event", "sign_up", { method });
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

  const notify = fetch("/api/leads/notify", {
    method: "POST",
    headers,
    body: JSON.stringify({ kind }),
    keepalive: true,
  }).then(() => undefined, () => undefined);

  return Promise.race([
    notify,
    new Promise<void>((resolve) => {
      window.setTimeout(resolve, 2000);
    }),
  ]);
}

/**
 * Erro no cadastro → GA4 `cadastro_erro` com o tipo do erro (sem e-mail, nome
 * nem mensagem bruta — nada de dado pessoal).
 */
export function trackCadastroErro(
  errorType: string,
  method: "email" | "google" = "email"
): void {
  try {
    gtag("event", "cadastro_erro", {
      error_type: errorType.slice(0, 40),
      method,
    });
  } catch {
    /* ignore */
  }
}
