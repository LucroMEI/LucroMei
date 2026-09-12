export type BlogPost = {
  slug: string;
  title: string;
  description: string;
  keywords: string[];
  date: string;
};

export const BLOG_POSTS: BlogPost[] = [
  {
    slug: "app-para-mei",
    title: "App para MEI: como organizar suas finanças sem complicação",
    description:
      "Descubra como um app para MEI pode substituir a planilha e mostrar, na hora, quanto você realmente lucrou. Simples, rápido e sem termos contábeis.",
    keywords: ["app para mei", "controle financeiro mei", "planilha mei"],
    date: "2026-08-31",
  },
  {
    slug: "controle-financeiro-mei",
    title: "Controle financeiro para MEI: como fazer sem complicação",
    description:
      "Aprenda como fazer o controle financeiro do seu MEI de forma simples, saber quanto realmente sobra no mês e evitar surpresas com o limite anual.",
    keywords: [
      "controle financeiro mei",
      "como organizar financas mei",
      "quanto sobra mei",
    ],
    date: "2026-08-31",
  },
  {
    slug: "planilha-mei-gratis",
    title: "Planilha MEI grátis: vale a pena ou existe algo mais simples?",
    description:
      "Baixe uma planilha MEI grátis e compare com um app que lê o comprovante. Veja qual se encaixa melhor na sua rotina.",
    keywords: ["planilha mei gratis", "planilha mei", "caderno ou planilha mei"],
    date: "2026-08-31",
  },
];

export function getPost(slug: string) {
  return BLOG_POSTS.find((p) => p.slug === slug);
}
