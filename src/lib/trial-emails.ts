import { getSiteUrl } from "@/lib/site";

export type TrialEmailKind = "d1" | "d3" | "d7";

const INTERNAL_EMAIL_BITS = [
  "contato.lucromei",
  "sandrapaiva",
  "cirandando",
];

const INTERNAL_NAME_BITS = ["teste", "sandrinha", "cirandando"];

export function firstNameFrom(fullName: string | null | undefined, email?: string | null): string {
  const fromName = (fullName || "").trim().split(/\s+/)[0] || "";
  if (fromName && !fromName.includes("@")) {
    return fromName.charAt(0).toUpperCase() + fromName.slice(1);
  }
  const local = (email || "").split("@")[0]?.split(/[._-]/)[0] || "";
  if (!local) return "";
  return local.charAt(0).toUpperCase() + local.slice(1);
}

export function isInternalAccount(email: string | null | undefined, fullName?: string | null): boolean {
  const e = (email || "").toLowerCase();
  const n = (fullName || "").toLowerCase();
  if (!e) return true;
  if (INTERNAL_EMAIL_BITS.some((bit) => e.includes(bit))) return true;
  if (e.includes("teste")) return true;
  if (INTERNAL_NAME_BITS.some((bit) => n.includes(bit))) return true;
  if (n === "sandra" || n.startsWith("sandra ")) return true;
  return false;
}

/** Calendar days since signup in Brazil (São Paulo). Signup day = 0. */
export function trialDaysElapsed(createdAt: string, now = new Date()): number {
  const zone = "America/Sao_Paulo";
  const day = (d: Date) =>
    d.toLocaleDateString("en-CA", { timeZone: zone });
  const [ys, ms, ds] = day(new Date(createdAt)).split("-").map(Number);
  const [yn, mn, dn] = day(now).split("-").map(Number);
  const start = Date.UTC(ys, ms - 1, ds);
  const today = Date.UTC(yn, mn - 1, dn);
  return Math.max(0, Math.round((today - start) / 86_400_000));
}

/** One email per window so a missed day still sends the right recado. */
export function pickTrialEmailKind(daysElapsed: number): TrialEmailKind | null {
  if (daysElapsed >= 1 && daysElapsed <= 2) return "d1";
  if (daysElapsed >= 3 && daysElapsed <= 6) return "d3";
  if (daysElapsed >= 7 && daysElapsed <= 13) return "d7";
  return null;
}

export function trialEmailContent(kind: TrialEmailKind, firstName: string) {
  const hello = firstName ? `Oi, ${firstName}!` : "Oi!";
  const site = getSiteUrl();
  const upload = `${site}/upload?primeiro=1`;
  const dashboard = `${site}/dashboard`;

  if (kind === "d1") {
    return {
      subject: "Tira foto do comprovante pra ver o lucro",
      href: upload,
      cta: "Tira foto agora",
      text: [
        hello,
        "",
        "Seu teste de 14 dias já começou, sem cartão.",
        "",
        "O LucroMei mostra quanto sobrou quando você manda um comprovante. PIX, notinha ou recibo.",
        "",
        "Aperta o botão, tira a foto. Sem a foto o painel fica vazio.",
        "",
        `Tira foto agora: ${upload}`,
        "",
        "Qualquer coisa, responde este e-mail.",
        "",
        "Sandra",
        "LucroMei",
      ].join("\n"),
    };
  }

  if (kind === "d3") {
    return {
      subject: "E o comprovante de hoje?",
      href: upload,
      cta: "Mandar comprovante",
      text: [
        hello,
        "",
        "Passaram 3 dias do seu teste.",
        "",
        "Se ainda não mandou nenhum comprovante, tira foto de um PIX ou da notinha agora.",
        "",
        "Se já mandou, manda o de hoje. Aí o lucro do mês fica certo.",
        "",
        `Mandar comprovante: ${upload}`,
        "",
        "Ainda tem 11 dias grátis.",
        "",
        "Sandra",
        "LucroMei",
      ].join("\n"),
    };
  }

  return {
    subject: "Metade do teste: quanto sobrou este mês?",
    href: dashboard,
    cta: "Ver meu lucro",
    text: [
      hello,
      "",
      "Já foi uma semana. Ainda tem 7 dias de teste.",
      "",
      "Quem manda os comprovantes vê o lucro do mês num lugar só, sem planilha.",
      "",
      "Tira foto do que entrou e do que saiu esta semana.",
      "",
      `Ver meu lucro: ${dashboard}`,
      "",
      "No fim dos 14 dias você escolhe se assina. Sem cartão agora, sem cobrança escondida.",
      "",
      "Sandra",
      "LucroMei",
    ].join("\n"),
  };
}

export function trialEmailHtml(kind: TrialEmailKind, firstName: string): string {
  const { href, cta } = trialEmailContent(kind, firstName);
  const hello = firstName ? `Oi, ${firstName}!` : "Oi!";
  const blocks: Record<TrialEmailKind, string[]> = {
    d1: [
      "Seu teste de 14 dias já começou, sem cartão.",
      "O LucroMei mostra quanto sobrou quando você manda um comprovante. PIX, notinha ou recibo.",
      "Aperta o botão, tira a foto. Sem a foto o painel fica vazio.",
    ],
    d3: [
      "Passaram 3 dias do seu teste.",
      "Se ainda não mandou nenhum comprovante, tira foto de um PIX ou da notinha agora.",
      "Se já mandou, manda o de hoje. Aí o lucro do mês fica certo.",
      "Ainda tem 11 dias grátis.",
    ],
    d7: [
      "Já foi uma semana. Ainda tem 7 dias de teste.",
      "Quem manda os comprovantes vê o lucro do mês num lugar só, sem planilha.",
      "Tira foto do que entrou e do que saiu esta semana.",
      "No fim dos 14 dias você escolhe se assina. Sem cartão agora, sem cobrança escondida.",
    ],
  };
  const body = blocks[kind]
    .map(
      (line) =>
        `<p style="margin:0 0 14px;font-size:16px;line-height:1.5;color:#1e293b;">${escapeHtml(line)}</p>`
    )
    .join("");

  return `<!DOCTYPE html>
<html lang="pt-BR">
<body style="margin:0;padding:0;background:#faf6ee;">
  <div style="max-width:520px;margin:0 auto;padding:24px 16px;">
    <div style="background:#ffffff;border-radius:16px;padding:32px 28px;font-family:Arial,Helvetica,sans-serif;">
      <p style="margin:0 0 20px;font-size:18px;font-weight:bold;color:#059669;">LucroMei</p>
      <p style="margin:0 0 16px;font-size:16px;line-height:1.5;color:#1e293b;">${escapeHtml(hello)}</p>
      ${body}
      <p style="margin:24px 0;">
        <a href="${href}" style="display:inline-block;background:#c4a04a;color:#ffffff;text-decoration:none;padding:14px 22px;border-radius:12px;font-weight:bold;font-size:16px;">${escapeHtml(cta)}</a>
      </p>
      <p style="margin:28px 0 0;font-size:14px;line-height:1.5;color:#64748b;">Sandra<br>LucroMei</p>
    </div>
  </div>
</body>
</html>`;
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
