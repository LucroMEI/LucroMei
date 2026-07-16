"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Upload,
  List,
  FileBarChart2,
  Settings,
  CreditCard,
  Camera,
} from "lucide-react";
import { cn } from "@/lib/utils";

const links = [
  { href: "/dashboard", label: "Início", icon: LayoutDashboard },
  { href: "/upload", label: "Upload", icon: Upload },
  { href: "/transacoes", label: "Transações", icon: List },
  { href: "/relatorios", label: "Relatórios", icon: FileBarChart2 },
  { href: "/assinatura", label: "Plano", icon: CreditCard },
  { href: "/configuracoes", label: "Config", icon: Settings },
];

export function AppNav() {
  const pathname = usePathname();

  return (
    <>
      {/* Top bar desktop */}
      <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/90 backdrop-blur">
        <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4">
          <Link href="/dashboard" className="flex items-center gap-2 font-bold text-emerald-700">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-600 text-sm text-white">
              L
            </span>
            LucroMEI
          </Link>
          <nav className="hidden items-center gap-1 md:flex">
            {links.map(({ href, label, icon: Icon }) => {
              const active = pathname.startsWith(href);
              return (
                <Link
                  key={href}
                  href={href}
                  className={cn(
                    "flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                    active
                      ? "bg-emerald-50 text-emerald-700"
                      : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {label}
                </Link>
              );
            })}
          </nav>
        </div>
      </header>

      {/* Bottom nav mobile */}
      <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-slate-200 bg-white pb-safe md:hidden">
        <div className="mx-auto flex max-w-lg items-end justify-around px-1 pt-1">
          {links.slice(0, 5).map(({ href, label, icon: Icon }) => {
            const active = pathname.startsWith(href);
            const isUpload = href === "/upload";
            if (isUpload) {
              return (
                <Link
                  key={href}
                  href={href}
                  className="-mt-5 flex flex-col items-center"
                >
                  <span className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-600 text-white shadow-lg shadow-emerald-600/30">
                    <Camera className="h-6 w-6" />
                  </span>
                  <span className="mt-0.5 text-[10px] font-medium text-emerald-700">
                    Foto
                  </span>
                </Link>
              );
            }
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  "flex min-w-[56px] flex-col items-center gap-0.5 px-2 py-2 text-[10px] font-medium",
                  active ? "text-emerald-700" : "text-slate-500"
                )}
              >
                <Icon className="h-5 w-5" />
                {label}
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}
