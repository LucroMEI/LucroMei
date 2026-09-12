import type { Metadata } from "next";
import Link from "next/link";
import { BlogShell } from "@/components/blog-shell";
import { BLOG_POSTS } from "@/lib/blog";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Blog LucroMEI — app, controle financeiro e planilha para MEI",
  description:
    "Artigos práticos para MEI: app para MEI, controle financeiro e planilha MEI grátis. Sem termos contábeis complicados.",
  alternates: { canonical: "/blog" },
};

export default function BlogIndexPage() {
  return (
    <BlogShell
      title="Blog LucroMEI"
      description="Conteúdo para quem busca organizar o MEI sem planilha complicada — e saber quanto realmente sobrou."
    >
      <div className="space-y-4">
        {BLOG_POSTS.map((post) => (
          <Link
            key={post.slug}
            href={`/blog/${post.slug}`}
            className="block rounded-2xl border border-[#EAD6D8] bg-white p-5 shadow-sm transition hover:border-[#C4A35A]"
          >
            <p className="text-xs font-medium text-slate-500">{post.date}</p>
            <h2 className="mt-1 text-lg font-bold text-slate-900">{post.title}</h2>
            <p className="mt-2 text-sm text-slate-600">{post.description}</p>
            <p className="mt-3 text-sm font-semibold text-emerald-700">
              Ler artigo →
            </p>
          </Link>
        ))}
      </div>

      <div className="mt-8 rounded-2xl border border-emerald-200 bg-emerald-50 p-5">
        <p className="font-semibold text-emerald-900">Planilha MEI grátis</p>
        <p className="mt-1 text-sm text-emerald-800">
          Quem busca planilha pode baixar o modelo e, se quiser, testar o app com
          foto do comprovante.
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          <a href="/planilha-mei-lucromei.csv" download>
            <Button variant="outline" size="sm">
              Baixar planilha (CSV)
            </Button>
          </a>
          <Link href="/blog/planilha-mei-gratis">
            <Button size="sm">Ver artigo</Button>
          </Link>
        </div>
      </div>
    </BlogShell>
  );
}
