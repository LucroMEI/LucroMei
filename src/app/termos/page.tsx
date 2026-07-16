import type { Metadata } from "next";
import { LegalShell, H2, P, Ul } from "@/components/legal-shell";

export const metadata: Metadata = {
  title: "Termos de Uso e Condições Gerais de Venda",
  description:
    "Termos de uso e condições gerais de venda do LucroMEI — assinatura, teste grátis, cancelamento e limitações.",
};

export default function TermosPage() {
  return (
    <LegalShell
      title="Termos de Uso e Condições Gerais de Venda"
      subtitle="Última atualização: 15 de julho de 2026 · LucroMEI"
    >
      <section>
        <H2>1. Identificação do prestador</H2>
        <P>
          O serviço <strong>LucroMEI</strong> é prestado por{" "}
          <strong>Sandra Tavares</strong> (doravante “nós”, “LucroMEI” ou
          “Prestador”), na qualidade de microempreendimento digital / projeto em
          validação.
        </P>
        <P>
          Contato: através da página{" "}
          <a href="/contato" className="font-medium text-emerald-700 underline">
            Contato
          </a>{" "}
          ou Instagram{" "}
          <a
            href="https://www.instagram.com/lucromei.oficial"
            className="font-medium text-emerald-700 underline"
            target="_blank"
            rel="noreferrer"
          >
            @lucromei.oficial
          </a>
          .
        </P>
      </section>

      <section>
        <H2>2. Objeto do serviço</H2>
        <P>
          O LucroMEI é um aplicativo web de organização financeira voltado a MEIs,
          freelancers e autônomos, que permite, entre outras funções:
        </P>
        <Ul
          items={[
            "Registro de receitas e despesas (manual ou por upload de comprovante)",
            "Sugestão de categorização com apoio de inteligência artificial",
            "Dashboard com totais e estimativas de lucro e impostos (incl. DAS aproximado)",
            "Alertas de vencimento e exportação simples de relatórios",
          ]}
        />
        <P>
          <strong>O LucroMEI não é</strong> escritório de contabilidade, não emite
          NF-e completa, não é assessoria jurídica ou fiscal oficial e{" "}
          <strong>não substitui um contador</strong> nem o Portal do Empreendedor /
          órgãos públicos.
        </P>
      </section>

      <section>
        <H2>3. Aceitação dos termos</H2>
        <P>
          Ao criar conta, iniciar o teste grátis, utilizar o aplicativo ou concluir
          uma assinatura paga, você declara ter lido e aceito estes Termos de Uso e
          Condições Gerais de Venda, bem como a{" "}
          <a href="/privacidade" className="text-emerald-700 underline">
            Política de Privacidade
          </a>{" "}
          e a{" "}
          <a href="/confidencialidade" className="text-emerald-700 underline">
            Política de Confidencialidade
          </a>
          .
        </P>
        <P>
          Se não concordar, não utilize o serviço.
        </P>
      </section>

      <section>
        <H2>4. Público-alvo e elegibilidade</H2>
        <P>
          O serviço destina-se a pessoas com capacidade legal para contratar,
          preferencialmente MEIs, freelancers e autônomos no Brasil. Você é
          responsável pela veracidade dos dados informados.
        </P>
      </section>

      <section>
        <H2>5. Natureza das estimativas (cláusula essencial)</H2>
        <P>
          Todos os valores de lucro, DAS, IR e demais tributos apresentados pelo
          LucroMEI são <strong>estimativas aproximadas e meramente informativas</strong>,
          com base em regras simplificadas e dados que você próprio informa.
        </P>
        <Ul
          items={[
            "Podem existir diferenças em relação aos valores oficiais",
            "A legislação e as tabelas de DAS/IR mudam com o tempo",
            "Você permanece integralmente responsável por apurar, declarar e pagar tributos",
            "Multas, juros ou autuações decorrentes de decisões fiscais não são de responsabilidade do LucroMEI",
          ]}
        />
      </section>

      <section>
        <H2>6. Condições Gerais de Venda (assinatura)</H2>
        <H2>6.1. Planos e preços</H2>
        <P>Os planos disponíveis no MVP incluem, a título de referência:</P>
        <Ul
          items={[
            "Teste grátis: 14 (quatorze) dias, com acesso às funcionalidades do MVP",
            "Plano mensal: R$ 39,90 (trinta e nove reais e noventa centavos) por mês",
            "Plano anual: valor equivalente a aproximadamente R$ 29,90/mês, cobrado anualmente",
            "Plano Early Bird (quando disponível): condições promocionais limitadas",
          ]}
        />
        <P>
          Os preços vigentes são os exibidos na página de assinatura e/ou no
          checkout Stripe no momento da compra. Podemos alterar preços mediante
          aviso prévio razoável para ciclos futuros (não retroativos ao período já pago).
        </P>

        <H2>6.2. Pagamento</H2>
        <P>
          Os pagamentos são processados pela <strong>Stripe</strong>. O LucroMEI não
          armazena o número completo do cartão. A moeda de referência do MVP é o real
          brasileiro (BRL), salvo indicação em contrário no checkout.
        </P>

        <H2>6.3. Período de teste</H2>
        <P>
          O teste grátis de 14 dias pode ser oferecido no cadastro e/ou no fluxo de
          assinatura Stripe. Ao término do teste, a cobrança do plano escolhido poderá
          ocorrer automaticamente, conforme as condições apresentadas no checkout.
          Cancele antes do fim do teste se não desejar continuar.
        </P>

        <H2>6.4. Renovação e cancelamento</H2>
        <Ul
          items={[
            "Assinaturas são, em regra, de renovação automática até o cancelamento",
            "Você pode cancelar a qualquer momento pelo portal do cliente Stripe (quando disponível) ou solicitando via Contato",
            "O cancelamento encerra renovações futuras; o acesso permanece até o fim do período já pago, salvo disposição legal em contrário",
            "Não há reembolso proporcional automático de períodos já iniciados, salvo exigência legal aplicável ou cortesia comercial do Prestador",
          ]}
        />

        <H2>6.5. Inadimplência</H2>
        <P>
          Em caso de falha de pagamento, o acesso poderá ser suspenso ou limitado até a
          regularização, após tentativas de cobrança pela Stripe.
        </P>
      </section>

      <section>
        <H2>7. Conta e uso aceitável</H2>
        <P>Você compromete-se a:</P>
        <Ul
          items={[
            "Manter a confidencialidade de suas credenciais",
            "Não utilizar o serviço para fins ilícitos",
            "Não abusar da API de IA (uploads massivos, spam, engenharia adversária)",
            "Não tentar acessar dados de outros usuários",
            "Não realizar engenharia reversa maliciosa do software",
          ]}
        />
        <P>
          Podemos suspender ou encerrar contas que violem estes termos, sem prejuízo de
          medidas legais.
        </P>
      </section>

      <section>
        <H2>8. Propriedade intelectual</H2>
        <P>
          Marca, layout, textos, código e materiais do LucroMEI são de titularidade do
          Prestador ou de licenciantes. Você mantém a titularidade dos dados e
          comprovantes que enviar, concedendo-nos licença limitada para processá-los
          apenas para prestar o serviço.
        </P>
      </section>

      <section>
        <H2>9. Disponibilidade e MVP</H2>
        <P>
          O LucroMEI encontra-se em fase de validação (MVP). Funcionalidades podem
          mudar, ser adicionadas ou removidas. Podemos interromper o serviço para
          manutenção. Não garantimos disponibilidade ininterrupta de 100%.
        </P>
      </section>

      <section>
        <H2>10. Limitação de responsabilidade</H2>
        <P>
          Na máxima extensão permitida pela lei aplicável, o LucroMEI e o Prestador não
          respondem por:
        </P>
        <Ul
          items={[
            "Decisões fiscais, contábeis ou empresariais tomadas com base no app",
            "Multas, juros, autuações ou perdas de receita",
            "Erros de categorização da IA não revisados por você",
            "Indisponibilidade de terceiros (Stripe, hospedagem, provedores de IA)",
            "Danos indiretos, lucros cessantes ou perda de dados por falha do usuário",
          ]}
        />
        <P>
          Em qualquer hipótese, a responsabilidade total do Prestador, se reconhecida,
          limita-se ao valor pago por você nos últimos 12 (doze) meses pelo serviço.
        </P>
      </section>

      <section>
        <H2>11. Proteção de dados</H2>
        <P>
          O tratamento de dados pessoais segue a LGPD e está descrito na Política de
          Privacidade e na Política de Confidencialidade.
        </P>
      </section>

      <section>
        <H2>12. Alterações destes termos</H2>
        <P>
          Podemos atualizar estes termos. A data de “última atualização” será revisada.
          O uso continuado após a publicação das alterações constitui aceitação, quando
          permitido pela lei.
        </P>
      </section>

      <section>
        <H2>13. Lei aplicável e foro</H2>
        <P>
          Estes termos regem-se pelas leis da República Federativa do Brasil. Fica
          eleito o foro da comarca do domicílio do consumidor, quando aplicável o Código
          de Defesa do Consumidor; nos demais casos, o foro competente segundo a
          legislação vigente.
        </P>
      </section>

      <section>
        <H2>14. Contato</H2>
        <P>
          Dúvidas sobre estes termos: página{" "}
          <a href="/contato" className="text-emerald-700 underline">
            Contato
          </a>{" "}
          ou Instagram @lucromei.oficial.
        </P>
      </section>
    </LegalShell>
  );
}
