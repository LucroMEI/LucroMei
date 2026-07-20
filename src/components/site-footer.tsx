import Link from "next/link";
import { InstagramLink } from "@/components/instagram-link";

const links = [
  { href: "/faq", label: "Dúvidas (FAQ)" },
  { href: "/contato", label: "Contato" },
  { href: "/termos", label: "Termos e vendas" },
  { href: "/privacidade", label: "Privacidade" },
  { href: "/confidencialidade", label: "Confidencialidade" },
];

export function SiteFooter() {
  return (
    <footer className="border-t border-slate-200 bg-white py-10 text-sm text-slate-500">
      <div className="mx-auto max-w-5xl px-4">
        <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
          <div>
            <p className="font-semibold text-emerald-700">LucroMEI</p>
            <p className="mt-1 max-w-xs text-xs text-slate-500">
              Organização financeira para MEIs e freelancers. Estimativas apenas —
              não substitui contador.
            </p>
            <div className="mt-3 flex items-center gap-2">
              <InstagramLink variant="pill" />
            </div>
            <p className="mt-3 text-xs">© {new Date().getFullYear()} LucroMEI · Sandra Tavares</p>
          </div>
          <nav className="flex flex-wrap gap-x-5 gap-y-2">
            {links.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className="hover:text-slate-800 hover:underline"
              >
                {l.label}
              </Link>
            ))}
          </nav>
        </div>
        <p className="mt-8 text-center text-[11px] text-slate-400">
          Pagamentos processados pela Stripe. Ao assinar, você aceita os{" "}
          <Link href="/termos" className="underline">
            Termos e Condições Gerais de Venda
          </Link>{" "}
          e a{" "}
          <Link href="/privacidade" className="underline">
            Política de Privacidade
          </Link>
          .
        </p>
      </div>
    </footer>
  );
}
