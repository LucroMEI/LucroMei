import Link from "next/link";
import { SiteFooter } from "@/components/site-footer";
import { InstagramLink } from "@/components/instagram-link";
import { Button } from "@/components/ui/button";

export function BlogShell({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col bg-[#FBF6F4]">
      <header className="border-b border-[#EAD6D8] bg-white">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-4">
          <Link
            href="/"
            className="flex items-center gap-2 font-bold text-[#2B2426]"
          >
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-600 text-sm text-white">
              L
            </span>
            LucroMEI
          </Link>
          <nav className="flex flex-wrap items-center gap-3 text-xs text-slate-600 sm:text-sm">
            <Link href="/blog" className="font-medium hover:text-[#2B2426]">
              Blog
            </Link>
            <Link href="/calculadora" className="hover:text-[#2B2426]">
              Calculadora
            </Link>
            <Link href="/cadastro">
              <Button size="sm">14 dias grátis</Button>
            </Link>
            <InstagramLink className="h-8 w-8" iconClassName="h-3.5 w-3.5" />
          </nav>
        </div>
      </header>
      <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-10">
        <Link href="/blog" className="text-sm text-[#2B2426] hover:underline">
          ← Blog LucroMEI
        </Link>
        <h1 className="mt-4 text-3xl font-bold tracking-tight text-slate-900 md:text-4xl">
          {title}
        </h1>
        {description && (
          <p className="mt-3 text-base text-slate-600">{description}</p>
        )}
        <article className="prose-blog mt-8 space-y-5 text-[15px] leading-relaxed text-slate-700">
          {children}
        </article>
        <div className="mt-10 rounded-2xl border border-[#EAD6D8] bg-white p-5 text-center shadow-sm">
          <p className="text-sm font-semibold text-slate-900">
            Quer ver quanto realmente sobrou no mês?
          </p>
          <p className="mt-1 text-sm text-slate-600">
            Tire foto do comprovante. 14 dias grátis, sem cartão.
          </p>
          <div className="mt-4 flex flex-wrap justify-center gap-2">
            <Link href="/cadastro">
              <Button>Criar conta grátis</Button>
            </Link>
            <Link href="/calculadora">
              <Button variant="outline">Calculadora limite MEI</Button>
            </Link>
          </div>
        </div>
        <p className="mt-8 text-xs leading-relaxed text-slate-500">
          <strong>Estimativas apenas.</strong> O LucroMEI ajuda a organizar
          finanças e estimar impostos, mas <strong>não substitui um contador</strong>{" "}
          nem é assessoria fiscal oficial.
        </p>
      </main>
      <SiteFooter />
    </div>
  );
}

export function H2({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="pt-2 text-xl font-bold tracking-tight text-slate-900">
      {children}
    </h2>
  );
}

export function P({ children }: { children: React.ReactNode }) {
  return <p className="text-slate-700">{children}</p>;
}

export function Ul({ items }: { items: React.ReactNode[] }) {
  return (
    <ul className="list-disc space-y-2 pl-5 text-slate-700">
      {items.map((item, i) => (
        <li key={i}>{item}</li>
      ))}
    </ul>
  );
}
