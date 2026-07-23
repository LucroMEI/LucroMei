/** E-mails recentes no browser (NÃO guarda senhas — o gestor do navegador faz isso). */

const KEY = "lucromei_recent_emails";
const MAX = 8;

export function getRecentEmails(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return [];
    const list = JSON.parse(raw) as unknown;
    if (!Array.isArray(list)) return [];
    return list
      .filter((e): e is string => typeof e === "string" && e.includes("@"))
      .slice(0, MAX);
  } catch {
    return [];
  }
}

export function rememberEmail(email: string) {
  if (typeof window === "undefined") return;
  const normalized = email.trim().toLowerCase();
  if (!normalized.includes("@")) return;
  try {
    const prev = getRecentEmails().filter((e) => e !== normalized);
    const next = [normalized, ...prev].slice(0, MAX);
    localStorage.setItem(KEY, JSON.stringify(next));
  } catch {
    /* quota / private mode */
  }
}
