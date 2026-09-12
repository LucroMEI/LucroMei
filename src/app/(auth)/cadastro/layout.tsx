import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Criar conta",
  description: "Crie sua conta LucroMEI — 14 dias grátis, sem cartão.",
  alternates: { canonical: "/cadastro" },
  robots: { index: false, follow: false },
};

export default function CadastroLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
