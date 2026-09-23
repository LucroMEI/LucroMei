/** URL canônica do site (OG, sitemap, links absolutos), sem barra final. */
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
  // Fallback de produção (domínio oficial)
  return "https://uselucromei.com.br";
}

/**
 * URL absoluta para canonical / og:url / sitemap / JSON-LD.
 * Home: sem barra final. O Next.js serializa `/` como origin
 * (`https://uselucromei.com.br`), nunca `...br/`. Páginas internas
 * também sem barra (`/faq`, não `/faq/`).
 */
export function canonicalUrl(path: string = "/"): string {
  const base = getSiteUrl();
  const normalized = path.startsWith("/") ? path : `/${path}`;
  if (normalized === "/") return base;
  return `${base}${normalized.replace(/\/$/, "")}`;
}

/** Canonical + og:url iguais, para não herdar a home no Open Graph. */
export function urlMetadata(path: string) {
  const url = canonicalUrl(path);
  return {
    alternates: { canonical: url },
    openGraph: { url },
  };
}

export const SITE_NAME = "LucroMEI";
export const SITE_TAGLINE = "Tira foto do comprovante. Eu cuido do resto.";
export const SITE_DESCRIPTION =
  "Organize finanças do MEI: envie comprovante, IA categoriza, dashboard com lucro e estimativa de impostos (DAS). 14 dias grátis.";
