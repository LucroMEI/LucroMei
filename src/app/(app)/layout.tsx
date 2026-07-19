import { AppNav } from "@/components/app-nav";
import { Disclaimer } from "@/components/disclaimer";
import { TrialBanner } from "@/components/trial-banner";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-slate-50">
      <AppNav />
      <TrialBanner />
      <main className="mx-auto max-w-5xl px-4 py-6 pb-28 md:pb-10">{children}</main>
      <div className="mx-auto hidden max-w-5xl px-4 pb-8 md:block">
        <Disclaimer compact />
      </div>
    </div>
  );
}
