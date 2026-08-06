/** URL canônica do site (OG, sitemap, links absolutos). */
export function getSiteUrl(): string {
  const fromEnv = process.env.NEXT_PUBLIC_APP_URL?.trim();
  if (fromEnv && !fromEnv.includes("localhost")) {
    return fromEnv.replace(/\/$/, "");
  }
  if (process.env.VERCEL_PROJECT_PRODUCTION_URL) {
    return `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL.replace(/\/$/, "")}`;
  }
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL.replace(/\/$/, "")}`;
  }
  // Fallback de produção (webhook Stripe / docs)
  return "https://lucro-mei.vercel.app";
}

export const SITE_NAME = "LucroMEI";
export const SITE_TAGLINE = "Tira foto do comprovante. Eu cuido do resto.";
export const SITE_DESCRIPTION =
  "Organize finanças do MEI: envie comprovante, IA categoriza, dashboard com lucro e estimativa de impostos (DAS). 14 dias grátis.";
