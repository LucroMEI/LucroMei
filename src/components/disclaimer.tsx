import { ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";

/** Texto curto (topo da home e telas do app). */
export const DISCLAIMER_SHORT =
  "O LucroMEI organiza suas finanças e estima seus impostos para você decidir com mais segurança.";

/** Texto completo (rodapé, FAQ, relatórios, calculadora). */
export const DISCLAIMER_FULL =
  "O LucroMEI organiza suas finanças e estima seus impostos para você decidir com mais segurança. Para declarações oficiais, conte também com seu contador.";

export function Disclaimer({
  className,
  compact,
  short,
}: {
  className?: string;
  /** Linha pequena e discreta (dentro do app). */
  compact?: boolean;
  /** Só a frase curta, sem caixa (ex.: topo da home). */
  short?: boolean;
}) {
  if (compact) {
    return (
      <p className={cn("text-center text-[11px] text-slate-400", className)}>
        {DISCLAIMER_FULL}
      </p>
    );
  }
  if (short) {
    return (
      <p
        className={cn(
          "flex items-start justify-center gap-1.5 text-center text-xs font-medium text-slate-500",
          className
        )}
      >
        <ShieldCheck className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-600" />
        <span>{DISCLAIMER_SHORT}</span>
      </p>
    );
  }
  return (
    <div
      className={cn(
        "flex items-start gap-2 rounded-xl border border-emerald-100 bg-emerald-50/60 px-3 py-2 text-xs text-slate-700",
        className
      )}
    >
      <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
      <p>{DISCLAIMER_FULL}</p>
    </div>
  );
}
