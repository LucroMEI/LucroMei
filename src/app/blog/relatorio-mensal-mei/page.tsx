import type { Metadata } from "next";
import Link from "next/link";
import { BlogShell, H2, P, Ul } from "@/components/blog-shell";
import { getPost } from "@/lib/blog";
import { urlMetadata } from "@/lib/site";

const post = getPost("relatorio-mensal-mei")!;

export const metadata: Metadata = {
  title: post.title,
  description: post.description,
  keywords: post.keywords,
  ...urlMetadata("/blog/relatorio-mensal-mei"),
};

const link = "font-semibold text-emerald-700 underline";

export default function RelatorioMensalMeiPage() {
  return (
    <BlogShell title={post.title} description={post.description}>
      <P>
        Muita gente descobre o <strong>Relatório Mensal de Receitas Brutas</strong>{" "}
        só quando o contador pede. Ele é simples, mas é uma obrigação do MEI e
        ajuda muito na hora da declaração anual (DASN-SIMEI).
      </P>

      <H2>O que é o relatório mensal do MEI</H2>
      <P>
        É um resumo de <strong>quanto você faturou no mês</strong>, separado por
        tipo de receita:
      </P>
      <Ul
        items={[
          <>Revenda de mercadorias (comércio);</>,
          <>Venda de produtos fabricados por você (indústria);</>,
          <>Prestação de serviços.</>,
        ]}
      />
      <P>
        Em cada grupo, você informa o valor vendido <strong>com nota fiscal</strong>{" "}
        e <strong>sem nota fiscal</strong>, e o total do mês.
      </P>

      <H2>Qual o prazo?</H2>
      <P>
        O relatório deve ser preenchido <strong>até o dia 20 do mês seguinte</strong>.
        Exemplo: o de novembro, até 20 de dezembro.
      </P>

      <H2>Precisa enviar para algum lugar?</H2>
      <P>
        Não. Ele <strong>não é entregue</strong> à Receita: você guarda o
        relatório junto com as notas fiscais de compras e de vendas do mês. Se
        houver fiscalização, é ele que mostra que o seu controle está em dia. O
        modelo oficial está no{" "}
        <a
          href="https://www.gov.br/empresas-e-negocios/pt-br/empreendedor"
          target="_blank"
          rel="noopener noreferrer"
          className={link}
        >
          Portal do Empreendedor
        </a>
        .
      </P>

      <H2>Como fazer sem complicação</H2>
      <Ul
        items={[
          <>Anote cada venda ou PIX recebido no dia em que entrou.</>,
          <>Guarde o comprovante (foto já serve para o seu controle).</>,
          <>No começo do mês, some o mês anterior e preencha o relatório.</>,
          <>Aproveite para comparar o total do ano com o limite do MEI.</>,
        ]}
      />
      <P>
        O mais difícil é não deixar acumular. No <strong>LucroMEI</strong>, você
        tira foto do comprovante ou do PIX, o app lê valor e data, e no fim do mês
        você já tem o total de receitas, as despesas e o lucro estimado para
        consultar na hora de preencher o relatório.{" "}
        <Link href="/cadastro" className={link}>
          Teste grátis por 14 dias, sem cartão
        </Link>
        .
      </P>
      <P>
        O LucroMEI organiza suas finanças e estima seus impostos. Para as
        declarações oficiais, conte também com seu contador.
      </P>

      <H2>Perguntas frequentes</H2>
      <P>
        <strong>Quem não vendeu nada no mês precisa preencher?</strong>
        <br />
        O recomendado é manter o controle de todos os meses, mesmo com valor
        zero, para a declaração anual bater.
      </P>
      <P>
        <strong>O relatório mensal substitui a declaração anual?</strong>
        <br />
        Não. A DASN-SIMEI continua sendo entregue uma vez por ano. O relatório
        mensal só facilita fazer essa declaração certinha.
      </P>

      <P>
        Veja também:{" "}
        <Link href="/blog/limite-mei-2026-2027" className={link}>
          Limite do MEI em 2026 e 2027
        </Link>{" "}
        e{" "}
        <Link href="/blog/planilha-mei-gratis" className={link}>
          Planilha MEI grátis
        </Link>
        .
      </P>
    </BlogShell>
  );
}
