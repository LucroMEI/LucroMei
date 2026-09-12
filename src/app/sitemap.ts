import type { MetadataRoute } from "next";
import { getSiteUrl } from "@/lib/site";

/** Páginas públicas indexáveis (sem login/cadastro/área logada). */
export default function sitemap(): MetadataRoute.Sitemap {
  const base = getSiteUrl();

  const publicPaths: {
    path: string;
    priority: number;
    changeFrequency: MetadataRoute.Sitemap[0]["changeFrequency"];
  }[] = [
    { path: "/", priority: 1.0, changeFrequency: "weekly" },
    { path: "/calculadora", priority: 0.9, changeFrequency: "monthly" },
    { path: "/faq", priority: 0.8, changeFrequency: "monthly" },
    { path: "/contato", priority: 0.6, changeFrequency: "monthly" },
    { path: "/termos", priority: 0.4, changeFrequency: "yearly" },
    { path: "/privacidade", priority: 0.4, changeFrequency: "yearly" },
    { path: "/confidencialidade", priority: 0.3, changeFrequency: "yearly" },
    { path: "/blog", priority: 0.85, changeFrequency: "weekly" },
    { path: "/blog/app-para-mei", priority: 0.85, changeFrequency: "monthly" },
    {
      path: "/blog/controle-financeiro-mei",
      priority: 0.85,
      changeFrequency: "monthly",
    },
    {
      path: "/blog/planilha-mei-gratis",
      priority: 0.9,
      changeFrequency: "monthly",
    },
  ];

  return publicPaths.map(({ path, priority, changeFrequency }) => ({
    url: `${base}${path === "/" ? "/" : path}`,
    lastModified: new Date(),
    changeFrequency,
    priority,
  }));
}
