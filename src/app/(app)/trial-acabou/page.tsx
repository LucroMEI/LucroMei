"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { isSupabaseConfigured, createClient } from "@/lib/supabase/client";
import { ensureUserSettings } from "@/lib/user-settings";
import { formatDateBR } from "@/lib/format";
import { clearDemoData } from "@/lib/demo-store";

export default function TrialAcabouPage() {
  const router = useRouter();
  const [endLabel, setEndLabel] = useState<string | null>(null);
  const [email, setEmail] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState("");

  useEffect(() => {
    if (!isSupabaseConfigured()) return;
    (async () => {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;
      setEmail(user.email ?? null);
      setUserId(user.id);
      const settings = await ensureUserSettings(supabase, user);
      if (settings?.trial_ends_at) {
        setEndLabel(formatDateBR(settings.trial_ends_at.slice(0, 10)));
      }
    })();
  }, []);

  async function logout() {
    if (isSupabaseConfigured()) {
      try {
        const supabase = createClient();
        await supabase.auth.signOut();
      } catch {
        // ignore
      }
    }
    window.location.href = "/";
  }

  async function deleteAccount() {
    setDeleteError("");
    const ok = confirm(
      "Excluir esta conta LucroMei de forma permanente?\n\nIsto apaga o login e os dados. Não dá para desfazer."
    );
    if (!ok) return;
    const typed = window.prompt("Para confirmar, digite EXCLUIR (em maiúsculas):");
    if (typed !== "EXCLUIR") {
      setDeleteError("Exclusão cancelada. É preciso digitar EXCLUIR.");
      return;
    }
    setDeleting(true);
    try {
      const res = await fetch("/api/account/delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ confirm: "EXCLUIR" }),
      });
      const data = (await res.json().catch(() => ({}))) as { error?: string };
      if (!res.ok) {
        setDeleteError(data.error || "Não foi possível excluir a conta.");
        return;
      }
      clearDemoData(userId ?? undefined);
      if (isSupabaseConfigured()) {
        try {
          const supabase = createClient();
          await supabase.auth.signOut();
        } catch {
          // ignore
        }
      }
      router.push("/?conta=excluida");
      router.refresh();
    } catch (err) {
      setDeleteError(err instanceof Error ? err.message : "Erro ao excluir");
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div className="mx-auto flex min-h-[60vh] max-w-lg flex-col justify-center px-2">
      <Card className="border-2 border-amber-300 shadow-md">
        <CardHeader>
          <CardTitle className="text-xl">
            O intervalo acabou — e o caixa não gosta de férias longas ☕
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-sm text-slate-700">
          <p>
            {email ? (
              <>
                Conta: <strong>{email}</strong>
                <br />
              </>
            ) : null}
            {endLabel ? (
              <>
                Seus 14 dias grátis encerraram em <strong>{endLabel}</strong>.
              </>
            ) : (
              <>Seus 14 dias grátis encerraram.</>
            )}
          </p>
          <p className="rounded-xl border border-amber-200 bg-amber-50/80 px-3 py-2.5 text-amber-950">
            <strong>Sem drama e sem cobrança surpresa:</strong> você{" "}
            <strong>não foi cobrada</strong>. O acesso ficou em pausa — tipo
            “estacionamento inteligente” do MEI. Para voltar a organizar
            comprovantes e ver o lucro com clareza, é só escolher um plano.
          </p>
          <p>
            Early Bird de lançamento (quando ainda houver vagas) a partir de{" "}
            <strong>R$ 19,90/mês</strong>, Mensal a <strong>R$ 29,90/mês</strong>{" "}
            ou Anual a <strong>R$ 24,90/mês</strong>.
            Se preferir parar por aqui, é só não assinar — a gente se despede de
            bem e sem fatura escondida.
          </p>
          <div className="flex flex-col gap-2 sm:flex-row">
            <Link href="/assinatura" className="flex-1">
              <Button className="w-full">Escolher meu plano</Button>
            </Link>
            <Link href="/contato" className="flex-1">
              <Button variant="outline" className="w-full">
                Falar conosco
              </Button>
            </Link>
          </div>
          {deleteError && (
            <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
              {deleteError}
            </p>
          )}
          <button
            type="button"
            onClick={logout}
            className="w-full text-center text-xs font-medium text-slate-500 underline"
          >
            Sair da conta
          </button>
          <button
            type="button"
            onClick={deleteAccount}
            disabled={deleting}
            className="w-full text-center text-xs font-medium text-rose-700 underline disabled:opacity-50"
          >
            {deleting ? "Excluindo…" : "Excluir esta conta"}
          </button>
        </CardContent>
      </Card>
    </div>
  );
}
