import Link from "next/link";
import { InstagramLink } from "@/components/instagram-link";

const links = [
  { href: "/faq", label: "Dúvidas (FAQ)" },
  { href: "/contato", label: "Suporte / Contato" },
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
              Organização financeira para MEIs do Brasil. Estimativas apenas —
              não substitui contador.
            </p>
            <div className="mt-3 space-y-1 text-xs text-slate-500">
              <p>
                <span className="font-medium text-slate-700">Empresa / responsável:</span>{" "}
                Sandra Tavares
              </p>
              <p>
                <span className="font-medium text-slate-700">Atividade:</span> auto-entrepreneur
                (França) · produto digital para MEIs no Brasil
              </p>
              <p>
                <span className="font-medium text-slate-700">SIRET:</span> 990 810 608 00010
              </p>
              <p>
                <span className="font-medium text-slate-700">Suporte:</span>{" "}
                <a
                  href="mailto:contato.lucromei@gmail.com"
                  className="text-emerald-700 hover:underline"
                >
                  contato.lucromei@gmail.com
                </a>
                {" · "}
                <Link href="/contato" className="text-emerald-700 hover:underline">
                  formulário
                </Link>
              </p>
              <p>
                <span className="font-medium text-slate-700">Instagram:</span> @lucromei.oficial
              </p>
            </div>
            <div className="mt-3 flex items-center gap-2">
              <InstagramLink variant="pill" />
            </div>
            <p className="mt-3 text-xs">
              © {new Date().getFullYear()} LucroMEI · Sandra Tavares
            </p>
          </div>
          <nav className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:gap-x-5 sm:gap-y-2">
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
          . Suporte:{" "}
          <a href="mailto:contato.lucromei@gmail.com" className="underline">
            contato.lucromei@gmail.com
          </a>
          .
        </p>
      </div>
    </footer>
  );
}
