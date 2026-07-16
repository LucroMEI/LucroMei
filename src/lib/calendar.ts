/**
 * Gera evento de calendário (ICS + Google Calendar) para lembrete do DAS.
 * O utilizador escolhe — nada é adicionado automaticamente.
 */

function pad(n: number) {
  return String(n).padStart(2, "0");
}

/** Formato ICS all-day: YYYYMMDD */
export function toIcsDate(d: Date): string {
  return `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}`;
}

/** UTC timestamp for DTSTAMP */
function icsNow(): string {
  const d = new Date();
  return (
    d.getUTCFullYear() +
    pad(d.getUTCMonth() + 1) +
    pad(d.getUTCDate()) +
    "T" +
    pad(d.getUTCHours()) +
    pad(d.getUTCMinutes()) +
    pad(d.getUTCSeconds()) +
    "Z"
  );
}

function escapeIcs(text: string): string {
  return text
    .replace(/\\/g, "\\\\")
    .replace(/;/g, "\\;")
    .replace(/,/g, "\\,")
    .replace(/\n/g, "\\n");
}

export type DasCalendarEvent = {
  dueDate: Date;
  amountBrl: number;
  title?: string;
  /** Lembrete em minutos antes (ex.: 1 dia = 1440) */
  reminderMinutes?: number;
};

export function buildDasIcs(event: DasCalendarEvent): string {
  const start = new Date(
    event.dueDate.getFullYear(),
    event.dueDate.getMonth(),
    event.dueDate.getDate()
  );
  const end = new Date(start);
  end.setDate(end.getDate() + 1); // all-day event: DTEND exclusive

  const amount = event.amountBrl.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
  const title = event.title || `Pagar DAS MEI (~${amount})`;
  const description = [
    `Lembrete LucroMEI: vencimento do DAS MEI.`,
    `Valor estimado: ${amount} (confira no PGMEI — estimativa do app).`,
    `Pague no Portal do Empreendedor / app PGMEI.`,
    `Estimativas apenas. Não substitui contador.`,
  ].join("\\n");

  const uid = `das-${toIcsDate(start)}-${event.amountBrl}@lucromei.app`;
  const alarm = event.reminderMinutes ?? 24 * 60; // 1 dia antes

  return [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//LucroMEI//DAS//PT",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "BEGIN:VEVENT",
    `UID:${uid}`,
    `DTSTAMP:${icsNow()}`,
    `DTSTART;VALUE=DATE:${toIcsDate(start)}`,
    `DTEND;VALUE=DATE:${toIcsDate(end)}`,
    `SUMMARY:${escapeIcs(title)}`,
    `DESCRIPTION:${description}`,
    "STATUS:CONFIRMED",
    "TRANSP:TRANSPARENT",
    "BEGIN:VALARM",
    "ACTION:DISPLAY",
    `DESCRIPTION:${escapeIcs(title)}`,
    `TRIGGER:-PT${alarm}M`,
    "END:VALARM",
    "END:VEVENT",
    "END:VCALENDAR",
    "",
  ].join("\r\n");
}

export function downloadIcs(filename: string, icsContent: string) {
  const blob = new Blob([icsContent], { type: "text/calendar;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

/** Link “Adicionar ao Google Calendar” (abre no browser; o utilizador confirma). */
export function googleCalendarUrl(event: DasCalendarEvent): string {
  const start = new Date(
    event.dueDate.getFullYear(),
    event.dueDate.getMonth(),
    event.dueDate.getDate()
  );
  const end = new Date(start);
  end.setDate(end.getDate() + 1);

  const amount = event.amountBrl.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
  const title = event.title || `Pagar DAS MEI (~${amount})`;
  const details = [
    "Lembrete LucroMEI: vencimento do DAS MEI.",
    `Valor estimado: ${amount} (confira no PGMEI).`,
    "Pague no Portal do Empreendedor / PGMEI.",
    "Estimativas apenas — não substitui contador.",
  ].join("\n");

  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: title,
    dates: `${toIcsDate(start)}/${toIcsDate(end)}`,
    details,
    ctz: "America/Sao_Paulo",
  });

  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}
