import { Resend } from "resend";
import { firstNameFrom, isInternalAccount } from "@/lib/trial-emails";

export type OwnerLeadKind =
  | "cadastro"
  | "primeiro_comprovante"
  | "assinatura"
  | "resumo";

export type OwnerLeadPayload = {
  fullName?: string | null;
  email?: string | null;
  plan?: string | null;
  /** Yesterday's new signups for the morning recap. */
  rows?: { name: string; email: string }[];
  paidCount?: number;
};

export function ownerInbox(): string {
  return (
    process.env.LEADS_TO?.trim() ||
    process.env.RESEND_REPLY_TO?.trim() ||
    "contato.lucromei@gmail.com"
  );
}

function ownerFrom(): string {
  return (
    process.env.RESEND_FROM?.trim() || "LucroMei <avisos@uselucromei.com.br>"
  );
}

function planLabel(plan?: string | null): string {
  if (plan === "earlybird") return "Early Bird";
  if (plan === "yearly") return "Anual";
  if (plan === "monthly") return "Mensal";
  return plan?.trim() || "pago";
}

export function ownerLeadContent(kind: OwnerLeadKind, payload: OwnerLeadPayload) {
  const name = firstNameFrom(payload.fullName, payload.email);
  const who = name || "Alguém";
  const mail = (payload.email || "").trim();

  if (kind === "cadastro") {
    return {
      subject: `LucroMei: novo cadastro — ${who}`,
      text: [
        `${who} criou conta agora.`,
        mail ? `E-mail: ${mail}` : "",
        "",
        "Começou o teste de 14 dias, sem cartão. Ainda não pagou.",
        "O próximo passo dela é tira foto do comprovante.",
        "",
        "Quando mandar a primeira foto, você recebe outro aviso.",
        "",
        "LucroMei",
      ]
        .filter((line, i, arr) => line !== "" || arr[i - 1] !== "")
        .join("\n"),
    };
  }

  if (kind === "primeiro_comprovante") {
    return {
      subject: `LucroMei: lead usou o app — ${who}`,
      text: [
        `${who} mandou o primeiro comprovante.`,
        mail ? `E-mail: ${mail}` : "",
        "",
        "Este é o lead que importa: cadastrou e usou.",
        "",
        "LucroMei",
      ]
        .filter((line) => line !== "")
        .join("\n"),
    };
  }

  if (kind === "assinatura") {
    return {
      subject: `LucroMei: nova assinatura — ${who}`,
      text: [
        `${who} assinou o plano ${planLabel(payload.plan)}.`,
        mail ? `E-mail: ${mail}` : "",
        "",
        "Pagamento pelo Stripe.",
        "",
        "LucroMei",
      ]
        .filter((line) => line !== "")
        .join("\n"),
    };
  }

  const rows = payload.rows || [];
  const list = rows
    .map((r) => {
      const n = r.name || "Alguém";
      return r.email ? `• ${n} — ${r.email}` : `• ${n}`;
    })
    .join("\n");
  const paid = payload.paidCount ?? 0;
  return {
    subject:
      rows.length === 1
        ? "LucroMei: 1 cadastro ontem"
        : `LucroMei: ${rows.length} cadastros ontem`,
    text: [
      "Cadastros de ontem:",
      list || "• (nenhum)",
      "",
      `Assinantes pagos agora: ${paid}.`,
      "",
      "LucroMei",
    ].join("\n"),
  };
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function ownerLeadHtml(kind: OwnerLeadKind, payload: OwnerLeadPayload): string {
  const { text } = ownerLeadContent(kind, payload);
  const paragraphs = text
    .split("\n")
    .filter((line) => line.length > 0)
    .map(
      (line) =>
        `<p style="margin:0 0 12px;font-size:16px;line-height:1.5;color:#1e293b;">${escapeHtml(line)}</p>`
    )
    .join("");
  return `<!DOCTYPE html>
<html lang="pt-BR">
<body style="margin:0;padding:0;background:#faf6ee;">
  <div style="max-width:520px;margin:0 auto;padding:24px 16px;">
    <div style="background:#ffffff;border-radius:16px;padding:32px 28px;font-family:Arial,Helvetica,sans-serif;">
      <p style="margin:0 0 20px;font-size:18px;font-weight:bold;color:#059669;">LucroMei</p>
      ${paragraphs}
    </div>
  </div>
</body>
</html>`;
}

export async function sendOwnerLead(
  kind: OwnerLeadKind,
  payload: OwnerLeadPayload
): Promise<{ ok: boolean; skipped?: boolean; error?: string }> {
  if (kind !== "resumo") {
    // E-mail vazio não é conta interna; o placeholder evita o skip de "sem e-mail".
    if (isInternalAccount(payload.email || "keep@lead.local", payload.fullName)) {
      return { ok: true, skipped: true };
    }
  }

  const apiKey = process.env.RESEND_API_KEY?.trim();
  if (!apiKey) {
    return { ok: false, error: "no_resend" };
  }

  const to = ownerInbox();
  const { subject, text } = ownerLeadContent(kind, payload);

  try {
    const resend = new Resend(apiKey);
    const { error } = await resend.emails.send({
      from: ownerFrom(),
      to,
      subject,
      text,
      html: ownerLeadHtml(kind, payload),
    });
    if (error) {
      console.error("[owner-leads] send", kind, error.message);
      return { ok: false, error: error.message };
    }
    return { ok: true };
  } catch (err) {
    const message = err instanceof Error ? err.message : "send_failed";
    console.error("[owner-leads] send", kind, message);
    return { ok: false, error: message };
  }
}
