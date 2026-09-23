import type { Metadata } from "next";
import Link from "next/link";
import { BlogShell, H2, P, Ul } from "@/components/blog-shell";
import { getPost } from "@/lib/blog";
import { urlMetadata } from "@/lib/site";

const post = getPost("app-para-mei")!;

export const metadata: Metadata = {
  title: post.title,
  description: post.description,
  keywords: post.keywords,
  ...urlMetadata("/blog/app-para-mei"),
};

export default function AppParaMeiPage() {
  return (
    <BlogShell title={post.title} description={post.description}>
      <P>
        Se você é Microempreendedor Individual e trabalha sozinho, provavelmente
        já passou por isso: fechou o mês, olhou o saldo da conta e pensou{" "}
        <em>&quot;será que eu lucrei ou só girei dinheiro?&quot;</em>.
      </P>
      <P>
        Esse é um dos maiores desafios de quem é MEI — não porque falta
        competência, mas porque{" "}
        <strong>
          controlar as finanças manualmente toma tempo que o dia a dia não
          permite
        </strong>
        . É aqui que entra um app para MEI.
      </P>

      <H2>Por que o MEI precisa de controle financeiro</H2>
      <P>
        O faturamento bruto (o que entra na conta) não é o mesmo que lucro.
        Entre receitas e despesas — material, deslocamento, ferramentas,
        impostos — o valor que realmente sobra costuma ser bem diferente do que
        a maioria imagina.
      </P>
      <P>Sem esse controle, dois problemas aparecem:</P>
      <Ul
        items={[
          <>
            <strong>Você não sabe se o negócio está de fato dando lucro</strong>{" "}
            ou só cobrindo custos.
          </>,
          <>
            <strong>
              Corre o risco de ultrapassar o limite anual do MEI (R$ 81 mil)
            </strong>{" "}
            sem perceber — use também a{" "}
            <Link href="/calculadora" className="font-semibold text-emerald-700 underline">
              calculadora grátis de limite MEI
            </Link>
            .
          </>,
        ]}
      />

      <H2>Planilha, caderno ou app: qual escolher</H2>
      <P>
        <strong>Caderno / anotação manual</strong> — funciona com poucos
        lançamentos, mas é fácil esquecer e difícil somar no fim do mês.
      </P>
      <P>
        <strong>Planilha</strong> — mais organizada, porém exige fórmulas,
        categorias e disciplina. Para rotina corrida, vira mais uma tarefa. Se
        ainda prefere planilha, veja nosso{" "}
        <Link
          href="/blog/planilha-mei-gratis"
          className="font-semibold text-emerald-700 underline"
        >
          guia da planilha MEI grátis
        </Link>{" "}
        (com arquivo para baixar).
      </P>
      <P>
        <strong>App para MEI</strong> — a ideia é reduzir o trabalho manual:
        você registra a movimentação (muitas vezes só com uma{" "}
        <strong>foto do comprovante</strong>) e o app organiza, categoriza e
        calcula o lucro estimado.
      </P>

      <H2>O que um bom app para MEI deve oferecer</H2>
      <Ul
        items={[
          <><strong>Cadastro rápido</strong>, sem burocracia</>,
          <><strong>Leitura automática de comprovantes</strong> (foto ou PDF)</>,
          <><strong>Lucro estimado</strong> claro (receitas − despesas)</>,
          <><strong>Lembrete do DAS</strong></>,
          <><strong>Linguagem simples</strong>, sem jargão contábil</>,
        ]}
      />

      <H2>Como o LucroMEI resolve isso</H2>
      <P>
        O{" "}
        <Link href="/" className="font-semibold text-emerald-700 underline">
          LucroMEI
        </Link>{" "}
        foi criado para o MEI que trabalha sozinho e não quer planilha. Basta
        tirar uma foto do comprovante — a IA sugere valor, data e categoria — e
        o dashboard mostra quanto sobrou no mês, com lembrete do DAS.
      </P>
      <P>
        Você pode testar por <strong>14 dias grátis, sem cartão de crédito</strong>.
        Depois, se fizer sentido, os planos começam a partir de R$ 19,90/mês
        (Early Bird, enquanto houver vagas).
      </P>

      <H2>Perguntas frequentes</H2>
      <P>
        <strong>Um app para MEI substitui o contador?</strong>
        <br />
        Não. Ele organiza o dia a dia; questões fiscais mais complexas pedem
        contador.
      </P>
      <P>
        <strong>Preciso saber contabilidade?</strong>
        <br />
        Não. A linguagem é simples e o processo é guiado.
      </P>
      <P>
        <strong>É pago?</strong>
        <br />
        Há 14 dias grátis sem cartão. Depois, assinatura opcional.
      </P>

      <P>
        Também pode ler:{" "}
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
