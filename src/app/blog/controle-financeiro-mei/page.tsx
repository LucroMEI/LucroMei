import type { Metadata } from "next";
import Link from "next/link";
import { BlogShell, H2, P, Ul } from "@/components/blog-shell";
import { getPost } from "@/lib/blog";
import { urlMetadata } from "@/lib/site";

const post = getPost("controle-financeiro-mei")!;

export const metadata: Metadata = {
  title: post.title,
  description: post.description,
  keywords: post.keywords,
  ...urlMetadata("/blog/controle-financeiro-mei"),
};

export default function ControleFinanceiroMeiPage() {
  return (
    <BlogShell title={post.title} description={post.description}>
      <P>
        Fazer o controle financeiro do MEI não precisa ser complicado — mas
        também não pode ser ignorado. Quem trabalha sozinho e não separa
        receitas de despesas corre o risco de achar que está indo bem só porque
        &quot;o dinheiro está entrando&quot;, sem saber quanto sobra no fim do
        mês.
      </P>

      <H2>O que é controle financeiro, na prática</H2>
      <P>É saber, a qualquer momento:</P>
      <Ul
        items={[
          <><strong>Quanto entrou</strong> (receitas)</>,
          <><strong>Quanto saiu</strong> (despesas do negócio)</>,
          <><strong>Quanto sobrou de fato</strong> (lucro)</>,
          <><strong>Quanto será pago de imposto</strong> (DAS)</>,
        ]}
      />
      <P>
        Parece simples — e é. O problema não é a matemática, é a{" "}
        <strong>falta de tempo e disciplina para registrar tudo</strong> no dia
        a dia.
      </P>

      <H2>Os erros mais comuns do MEI</H2>
      <Ul
        items={[
          <>
            <strong>Misturar conta pessoal com a do negócio</strong> — quase
            impossível ver o lucro real.
          </>,
          <>
            <strong>Não registrar despesas pequenas</strong> — gasolina,
            materiais e taxas somam no mês.
          </>,
          <>
            <strong>Confundir faturamento com lucro</strong> — o que entra não é
            o que sobra.
          </>,
          <>
            <strong>Perder o prazo do DAS</strong> por falta de lembrete.
          </>,
        ]}
      />

      <H2>Métodos para organizar</H2>
      <P>
        <strong>Caderno</strong> — simples, mas exige disciplina e não soma
        sozinho.
      </P>
      <P>
        <strong>Planilha</strong> — estruturada, porém manual. Se quiser começar
        grátis, baixe nossa{" "}
        <Link
          href="/blog/planilha-mei-gratis"
          className="font-semibold text-emerald-700 underline"
        >
          planilha MEI
        </Link>
        .
      </P>
      <P>
        <strong>App especializado</strong> — você registra (muitas vezes com
        foto do comprovante) e o sistema categoriza e calcula o lucro.
      </P>

      <H2>Como simplificar com o LucroMEI</H2>
      <P>
        O{" "}
        <Link href="/" className="font-semibold text-emerald-700 underline">
          LucroMEI
        </Link>{" "}
        foi pensado para essa dor: tire uma foto do comprovante, a IA sugere
        valor, data e categoria, e o dashboard mostra o lucro estimado — sem
        termos contábeis complicados. Também avisa sobre o DAS.
      </P>
      <P>
        Experimente <strong>14 dias grátis, sem cartão</strong>. Acompanhe o
        teto anual com a{" "}
        <Link href="/calculadora" className="font-semibold text-emerald-700 underline">
          calculadora do limite MEI
        </Link>
        .
      </P>

      <H2>Perguntas frequentes</H2>
      <P>
        <strong>Com que frequência registrar?</strong>
        <br />
        O ideal é conforme as movimentações acontecem, para não acumular.
      </P>
      <P>
        <strong>Preciso separar conta pessoal e do negócio?</strong>
        <br />
        Sim — mesmo sem obrigatoriedade rígida, facilita ver o lucro real.
      </P>
      <P>
        <strong>Isso evita desenquadramento?</strong>
        <br />
        Ajuda, porque você acompanha o faturamento antes de chegar perto dos R$
        81 mil/ano.
      </P>

      <P>
        Veja também:{" "}
        <Link
          href="/blog/app-para-mei"
          className="font-semibold text-emerald-700 underline"
        >
          App para MEI
        </Link>
        .
      </P>
    </BlogShell>
  );
}
