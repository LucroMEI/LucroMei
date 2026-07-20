import Link from "next/link";
import { SiteFooter } from "@/components/site-footer";
import { InstagramLink } from "@/components/instagram-link";

export function LegalShell({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col bg-slate-50">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-4">
          <Link href="/" className="flex items-center gap-2 font-bold text-emerald-700">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-600 text-sm text-white">
              L
            </span>
            LucroMEI
          </Link>
          <nav className="flex flex-wrap items-center gap-3 text-xs text-slate-600 sm:text-sm">
            <Link href="/faq" className="hover:text-emerald-700">
              FAQ
            </Link>
            <Link href="/contato" className="hover:text-emerald-700">
              Contato
            </Link>
            <Link href="/termos" className="hover:text-emerald-700">
              Termos
            </Link>
            <InstagramLink className="h-8 w-8" iconClassName="h-3.5 w-3.5" />
          </nav>
        </div>
      </header>
      <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-10">
        <Link href="/" className="text-sm text-emerald-700 hover:underline">
          ← Voltar ao início
        </Link>
        <h1 className="mt-4 text-3xl font-bold tracking-tight text-slate-900">{title}</h1>
        {subtitle && <p className="mt-2 text-slate-600">{subtitle}</p>}
        <div className="mt-8 space-y-8 text-[15px] leading-relaxed text-slate-700">
          {children}
        </div>
        <p className="mt-12 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-xs text-amber-900">
          <strong>Aviso:</strong> estes textos são informativos para o MVP do LucroMEI e
          não substituem assessoria jurídica. Ajuste e-mail, dados da titular e
          jurisdição com um profissional se necessário.
        </p>
      </main>
      <SiteFooter />
    </div>
  );
}

export function H2({ children }: { children: React.ReactNode }) {
  return <h2 className="text-lg font-semibold text-slate-900">{children}</h2>;
}

export function P({ children }: { children: React.ReactNode }) {
  return <p className="mt-2">{children}</p>;
}

export function Ul({ items }: { items: string[] }) {
  return (
    <ul className="mt-2 list-disc space-y-1 pl-5">
      {items.map((item) => (
        <li key={item}>{item}</li>
      ))}
    </ul>
  );
}
