"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input, Label, Select } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Disclaimer } from "@/components/disclaimer";
import { useFinance } from "@/lib/use-finance";
import { clearDemoData } from "@/lib/demo-store";
import type { AtividadeMei, RegimeTributario } from "@/lib/types";
import { isSupabaseConfigured, createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

export default function ConfiguracoesPage() {
  const router = useRouter();
  const { ready, settings, updateSettings } = useFinance();
  const [saved, setSaved] = useState(false);

  const [fullName, setFullName] = useState("");
  const [cnpj, setCnpj] = useState("");
  const [cidade, setCidade] = useState("");
  const [uf, setUf] = useState("SP");
  const [regime, setRegime] = useState<RegimeTributario>("MEI");
  const [atividade, setAtividade] = useState<AtividadeMei>("servicos");
  const [meta, setMeta] = useState("4000");
  const [dasDia, setDasDia] = useState("20");

  useEffect(() => {
    if (!settings) return;
    setFullName(settings.full_name || "");
    setCnpj(settings.cnpj || "");
    setCidade(settings.cidade || "");
    setUf(settings.uf || "SP");
    setRegime(settings.regime_tributario);
    setAtividade(settings.atividade_mei);
    setMeta(String(settings.meta_mensal_lucro));
    setDasDia(String(settings.das_dia_vencimento));
  }, [settings]);

  if (!ready) return <p className="text-sm text-slate-500">Carregando…</p>;

  function onSave(e: React.FormEvent) {
    e.preventDefault();
    updateSettings({
      full_name: fullName,
      cnpj: cnpj || null,
      cidade: cidade || null,
      uf,
      regime_tributario: regime,
      atividade_mei: atividade,
      meta_mensal_lucro: Number(meta) || 0,
      das_dia_vencimento: Math.min(28, Math.max(1, Number(dasDia) || 20)),
      onboarding_done: true,
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  }

  async function logout() {
    if (isSupabaseConfigured()) {
      try {
        const supabase = createClient();
        await supabase.auth.signOut();
      } catch {
        // ignore
      }
    }
    router.push("/");
    router.refresh();
  }

  return (
    <div className="mx-auto max-w-xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Configurações</h1>
        <p className="text-sm text-slate-600">
          Perfil, regime, plano e sair da conta.
        </p>
      </div>

      {/* Conta no topo no mobile: Sair visível sem rolar */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Conta</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-2 sm:flex-row">
          <Button variant="outline" className="w-full sm:flex-1" onClick={logout}>
            Sair da conta
          </Button>
          <Button
            type="button"
            variant="secondary"
            className="w-full sm:flex-1"
            onClick={() => router.push("/assinatura")}
          >
            Ver plano / assinatura
          </Button>
        </CardContent>
      </Card>

      <form onSubmit={onSave}>
        <Card>
          <CardHeader>
            <CardTitle>Perfil e MEI</CardTitle>
            <CardDescription>
              Usado para estimar impostos e alertas.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="name">Nome</Label>
              <Input id="name" value={fullName} onChange={(e) => setFullName(e.target.value)} />
            </div>
            <div>
              <Label htmlFor="cnpj">CNPJ (opcional)</Label>
              <Input
                id="cnpj"
                value={cnpj}
                onChange={(e) => setCnpj(e.target.value)}
                placeholder="00.000.000/0001-00"
              />
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div className="col-span-2">
                <Label htmlFor="cidade">Cidade</Label>
                <Input
                  id="cidade"
                  value={cidade}
                  onChange={(e) => setCidade(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="uf">UF</Label>
                <Input
                  id="uf"
                  value={uf}
                  maxLength={2}
                  onChange={(e) => setUf(e.target.value.toUpperCase())}
                />
              </div>
            </div>
            <div>
              <Label htmlFor="regime">Regime tributário</Label>
              <Select
                id="regime"
                value={regime}
                onChange={(e) => setRegime(e.target.value as RegimeTributario)}
              >
                <option value="MEI">MEI</option>
                <option value="Simples">Simples Nacional</option>
                <option value="Autonomo">Autônomo / Carnê-leão</option>
                <option value="Outro">Outro</option>
              </Select>
            </div>
            <div>
              <Label htmlFor="atividade">Atividade MEI</Label>
              <Select
                id="atividade"
                value={atividade}
                onChange={(e) => setAtividade(e.target.value as AtividadeMei)}
              >
                <option value="comercio">Comércio</option>
                <option value="servicos">Serviços</option>
                <option value="comercio_servicos">Comércio + Serviços</option>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="meta">Meta de lucro mensal (R$)</Label>
                <Input
                  id="meta"
                  type="number"
                  value={meta}
                  onChange={(e) => setMeta(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="das">Dia vencimento DAS</Label>
                <Input
                  id="das"
                  type="number"
                  min={1}
                  max={28}
                  value={dasDia}
                  onChange={(e) => setDasDia(e.target.value)}
                />
              </div>
            </div>

            <Button type="submit" className="w-full">
              {saved ? "Salvo!" : "Salvar configurações"}
            </Button>
            <Disclaimer compact />
          </CardContent>
        </Card>
      </form>

      <Card>
        <CardHeader>
          <CardTitle>Dados neste aparelho</CardTitle>
        </CardHeader>
        <CardContent>
          <Button
            variant="ghost"
            className="w-full text-rose-600"
            onClick={() => {
              if (confirm("Apagar dados locais desta conta neste aparelho?")) {
                clearDemoData(settings?.user_id);
                window.location.reload();
              }
            }}
          >
            Limpar dados locais deste aparelho
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
