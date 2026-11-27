import type { Metadata } from "next";
import Link from "next/link";
import { BlogShell, H2, P, Ul } from "@/components/blog-shell";
import { getPost } from "@/lib/blog";
import { urlMetadata } from "@/lib/site";

const post = getPost("limite-mei-2026-2027")!;

export const metadata: Metadata = {
  title: post.title,
  description: post.description,
  keywords: post.keywords,
  ...urlMetadata("/blog/limite-mei-2026-2027"),
};

const link = "font-semibold text-emerald-700 underline";

export default function LimiteMeiPage() {
  return (
    <BlogShell title={post.title} description={post.description}>
      <P>
        Resumo rápido: <strong>em 2026 o limite do MEI continua R$ 81 mil por
        ano</strong>. A Lei Complementar nº 238/2026 aumentou o teto para{" "}
        <strong>R$ 110 mil a partir de 1º de janeiro de 2027</strong> e{" "}
        <strong>R$ 140 mil a partir de 2028</strong>. A mesma lei permite ao MEI
        ter até <strong>2 empregados</strong>.
      </P>

      <H2>Quanto o MEI pode faturar em 2026?</H2>
      <P>
        Até <strong>R$ 81.000 no ano</strong> (de janeiro a dezembro), o que dá em
        média <strong>R$ 6.750 por mês</strong>. Não é um limite mensal: você
        pode vender mais num mês e menos no outro, desde que o total do ano fique
        dentro do teto.
      </P>
      <P>
        Quem abriu o MEI no meio do ano tem um <strong>limite proporcional</strong>:
        R$ 6.750 multiplicado pelos meses de atividade (o mês de abertura conta
        inteiro). Exemplo: abriu em setembro de 2026, são 4 meses, então o limite
        de 2026 é R$ 27.000.
      </P>

      <H2>E em 2027 e 2028?</H2>
      <Ul
        items={[
          <>
            <strong>2027:</strong> teto de R$ 110.000 por ano (R$ 9.166,67 por
            mês no proporcional de quem abrir em 2027).
          </>,
          <>
            <strong>2028 em diante:</strong> teto de R$ 140.000 por ano (R$
            11.666,67 por mês no proporcional).
          </>,
          <>
            O faturamento de <strong>2026 continua valendo pelo limite antigo</strong>.
            Quem passar de R$ 81 mil em 2026 segue as regras de desenquadramento
            atuais.
          </>,
        ]}
      />
      <P>
        Confira sempre as orientações oficiais no{" "}
        <a
          href="https://www.gov.br/empresas-e-negocios/pt-br/empreendedor"
          target="_blank"
          rel="noopener noreferrer"
          className={link}
        >
          Portal do Empreendedor
        </a>
        , porque a aplicação da lei pode ser regulamentada em detalhes.
      </P>

      <H2>O que acontece se eu passar do limite?</H2>
      <Ul
        items={[
          <>
            <strong>Passou até 20%</strong> (em 2026, até R$ 97.200): você
            continua MEI até dezembro, paga um DAS complementar sobre o excesso na
            declaração anual e, em janeiro, passa a ser microempresa.
          </>,
          <>
            <strong>Passou mais de 20%:</strong> o desenquadramento é retroativo
            (a janeiro, ou à data de abertura) e os impostos são recalculados como
            microempresa. É o cenário mais caro.
          </>,
        ]}
      />
      <P>
        Nos dois casos, vale conversar com um contador antes de tomar a decisão.
      </P>

      <H2>Como acompanhar sem susto</H2>
      <P>
        O problema quase nunca é a regra, e sim não saber quanto já entrou no
        ano. Algumas dicas simples:
      </P>
      <Ul
        items={[
          <>Registre cada venda ou PIX recebido no mês em que entrou.</>,
          <>Compare o total do ano com o limite a cada mês, não só em dezembro.</>,
          <>
            Use a{" "}
            <Link href="/calculadora" className={link}>
              calculadora do limite MEI
            </Link>{" "}
            para ver se a projeção do ano fica dentro, perto ou acima do teto.
          </>,
        ]}
      />
      <P>
        No <strong>LucroMEI</strong> você tira foto do comprovante ou do PIX e o
        app soma as receitas do ano para você, com o lucro estimado do mês.{" "}
        <Link href="/cadastro" className={link}>
          Teste grátis por 14 dias, sem cartão
        </Link>
        .
      </P>

      <P>
        Veja também:{" "}
        <Link href="/blog/relatorio-mensal-mei" className={link}>
          Relatório mensal do MEI
        </Link>{" "}
        e{" "}
        <Link href="/blog/controle-financeiro-mei" className={link}>
          Controle financeiro para MEI
        </Link>
        .
      </P>
    </BlogShell>
  );
}
