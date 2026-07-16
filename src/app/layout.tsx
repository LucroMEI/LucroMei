import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "LucroMEI — Tira foto do comprovante. Eu cuido do resto.",
    template: "%s · LucroMEI",
  },
  description:
    "Organize finanças do MEI e freelancer: envie comprovante, IA categoriza, dashboard com lucro e estimativa de impostos.",
  keywords: ["MEI", "freelancer", "impostos", "DAS", "finanças", "comprovante", "Brasil"],
  openGraph: {
    title: "LucroMEI",
    description: "Tira foto do comprovante. Eu cuido do resto.",
    locale: "pt_BR",
    type: "website",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#059669",
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="pt-BR"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-slate-50 text-slate-900">
        {children}
      </body>
    </html>
  );
}
