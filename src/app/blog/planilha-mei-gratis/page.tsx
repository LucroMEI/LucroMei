import type { Metadata } from "next";
import Link from "next/link";
import { Download } from "lucide-react";
import { BlogShell, H2, P, Ul } from "@/components/blog-shell";
import { Button } from "@/components/ui/button";
import { getPost } from "@/lib/blog";
import { urlMetadata } from "@/lib/site";

const post = getPost("planilha-mei-gratis")!;

export const metadata: Metadata = {
  title: post.title,
  description: post.description,
  keywords: post.keywords,
  ...urlMetadata("/blog/planilha-mei-gratis"),
};

export default function PlanilhaMeiGratisPage() {
  return (
    <BlogShell title={post.title} description={post.description}>
      <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5">
        <p className="text-sm font-bold text-emerald-900">
          Quer a planilha primeiro? Pode baixar agora — grátis.
        </p>
        <p className="mt-1 text-sm text-emerald-800">
          Modelo simples (CSV) para Excel ou Google Planilhas. Sem cartão. Se
          depois cansar de digitar, o LucroMEI lê o comprovante com foto.
        </p>
        <a href="/planilha-mei-lucromei.csv" download className="mt-3 inline-flex">
          <Button size="sm">
            <Download className="h-4 w-4" />
            Baixar planilha MEI grátis
          </Button>
        </a>
      </div>

      <P>
        Buscar uma <strong>planilha MEI grátis</strong> costuma ser o primeiro
        passo de quem quer organizar o negócio sem gastar mais. Faz sentido: é
        conhecida, flexível e qualquer MEI monta em minutos.
      </P>
      <P>
        Antes de decidir se fica só nela, vale olhar as limitações — e uma
        alternativa quando a rotina apertar.
      </P>

      <H2>Vantagens da planilha MEI</H2>
      <Ul
        items={[
          <><strong>Gratuita</strong>, sem assinatura</>,
          <><strong>Flexível</strong> — você organiza do seu jeito</>,
          <>Pode funcionar <strong>offline</strong> (arquivo local)</>,
        ]}
      />

      <H2>Limitações que ninguém conta</H2>
      <Ul
        items={[
          <><strong>Digitação manual</strong> de cada movimentação</>,
          <><strong>Fórmulas quebram</strong> se a estrutura mudar sem querer</>,
          <>Fácil <strong>esquecer de atualizar</strong> em dias corridos</>,
          <>
            Em geral <strong>não avisa DAS</strong> nem proximidade do limite
            anual, a menos que você configure
          </>,
        ]}
      />
      <P>
        Com pouco movimento no mês, a planilha resolve bem. Com rotina cheia —
        realidade da maioria dos MEIs — ela vira mais uma tarefa administrativa.
      </P>

      <H2>Planilha vs caderno vs app</H2>
      <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
        <table className="w-full min-w-[480px] text-left text-sm">
          <thead className="bg-slate-50 text-slate-700">
            <tr>
              <th className="px-3 py-2 font-semibold">Método</th>
              <th className="px-3 py-2 font-semibold">Custo</th>
              <th className="px-3 py-2 font-semibold">Esforço</th>
              <th className="px-3 py-2 font-semibold">Avisos</th>
            </tr>
          </thead>
          <tbody className="text-slate-700">
            <tr className="border-t border-slate-100">
              <td className="px-3 py-2">Caderno</td>
              <td className="px-3 py-2">Grátis</td>
              <td className="px-3 py-2">Alto</td>
              <td className="px-3 py-2">Não</td>
            </tr>
            <tr className="border-t border-slate-100">
              <td className="px-3 py-2">Planilha</td>
              <td className="px-3 py-2">Grátis</td>
              <td className="px-3 py-2">Médio</td>
              <td className="px-3 py-2">Só se configurar</td>
            </tr>
            <tr className="border-t border-slate-100">
              <td className="px-3 py-2">App (LucroMEI)</td>
              <td className="px-3 py-2">14 dias grátis, depois plano</td>
              <td className="px-3 py-2">Baixo (foto)</td>
              <td className="px-3 py-2">DAS + lucro</td>
            </tr>
          </tbody>
        </table>
      </div>

      <H2>Baixe grátis — e compare depois</H2>
      <P>
        Não precisa escolher o app no primeiro clique.{" "}
        <strong>Leve a planilha</strong>, use no mês, e só se a digitação cansar
        teste a foto do comprovante.
      </P>
      <a href="/planilha-mei-lucromei.csv" download className="inline-flex">
        <Button variant="outline">
          <Download className="h-4 w-4" />
          Baixar de novo (CSV)
        </Button>
      </a>

      <H2>Quando o app faz mais sentido</H2>
      <P>
        Se o objetivo é só saber quanto sobrou sem complicação, o{" "}
        <Link href="/" className="font-semibold text-emerald-700 underline">
          LucroMEI
        </Link>{" "}
        troca a digitação pela <strong>foto ou PDF do comprovante</strong>: a IA
        sugere valor, data e categoria; o dashboard mostra o lucro estimado e o
        lembrete do DAS.
      </P>
      <P>
        <strong>14 dias grátis, sem cartão</strong> — compare com a planilha que
        você já usa. Não substituímos o contador; organizamos o dia a dia.
      </P>

      <H2>Perguntas frequentes</H2>
      <P>
        <strong>A planilha grátis basta no começo?</strong>
        <br />
        Pode ser, com poucos lançamentos. Conforme o volume cresce, o esforço
        manual também.
      </P>
      <P>
        <strong>Preciso pagar para baixar a planilha?</strong>
        <br />
        Não. O CSV é grátis. O app é opcional (com teste gratuito).
      </P>
      <P>
        <strong>O app substitui a planilha?</strong>
        <br />
        No dia a dia, sim para muitos MEIs. Questões contábeis específicas
        continuam com o contador.
      </P>

      <P>
        Leia também:{" "}
        <Link
          href="/blog/app-para-mei"
          className="font-semibold text-emerald-700 underline"
        >
          App para MEI
        </Link>{" "}
        e{" "}
        <Link
          href="/blog/controle-financeiro-mei"
          className="font-semibold text-emerald-700 underline"
        >
          Controle financeiro para MEI
        </Link>
        .
      </P>
    </BlogShell>
  );
}
