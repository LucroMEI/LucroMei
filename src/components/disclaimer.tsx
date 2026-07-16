import { AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";

export function Disclaimer({ className, compact }: { className?: string; compact?: boolean }) {
  if (compact) {
    return (
      <p className={cn("text-center text-[11px] text-slate-400", className)}>
        Estimativas apenas. Não substitui um contador.
      </p>
    );
  }
  return (
    <div
      className={cn(
        "flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-900",
        className
      )}
    >
      <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
      <p>
        <strong>Estimativas apenas.</strong> O LucroMEI ajuda a organizar finanças e
        estimar impostos, mas <strong>não substitui um contador</strong> nem é
        assessoria fiscal oficial.
      </p>
    </div>
  );
}
