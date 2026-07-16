import type { Metadata } from "next";
import { LegalShell, H2, P, Ul } from "@/components/legal-shell";

export const metadata: Metadata = {
  title: "Política de Confidencialidade",
  description:
    "Como o LucroMEI trata o sigilo de comprovantes e informações financeiras dos usuários.",
};

export default function ConfidencialidadePage() {
  return (
    <LegalShell
      title="Política de Confidencialidade"
      subtitle="Última atualização: 15 de julho de 2026 · Sigilo de informações do usuário"
    >
      <section>
        <H2>1. Compromisso</H2>
        <P>
          O LucroMEI trata como <strong>confidenciais</strong> as informações
          financeiras, comprovantes, descrições de lançamentos e demais dados de
          negócio que você inserir no aplicativo, nos termos desta política e da{" "}
          <a href="/privacidade" className="text-emerald-700 underline">
            Política de Privacidade
          </a>
          .
        </P>
      </section>

      <section>
        <H2>2. O que consideramos confidencial</H2>
        <Ul
          items={[
            "Valores de receitas e despesas",
            "Imagens e PDFs de comprovantes e recibos",
            "Categorias, notas e histórico de transações",
            "Dados de configuração do MEI (atividade, metas, CNPJ se informado)",
            "Comunicações privadas de suporte relacionadas à sua conta",
          ]}
        />
      </section>

      <section>
        <H2>3. O que não é confidencial</H2>
        <Ul
          items={[
            "Informações públicas do site (preços, marketing, FAQ)",
            "Dados agregados e anonimizados que não identifiquem você (ex.: estatísticas de uso do produto)",
            "Informações que você tornar públicas voluntariamente (ex.: depoimento com autorização)",
          ]}
        />
      </section>

      <section>
        <H2>4. Nossas obrigações</H2>
        <P>Comprometemo-nos a:</P>
        <Ul
          items={[
            "Não vender listas de usuários nem dados financeiros a terceiros para marketing alheio",
            "Restringir o acesso interno às informações ao necessário para operar e melhorar o serviço",
            "Utilizar provedores (hospedagem, pagamento, IA) apenas sob necessidade operacional",
            "Não divulgar comprovantes individuais publicamente sem sua autorização expressa",
          ]}
        />
      </section>

      <section>
        <H2>5. Uso de inteligência artificial</H2>
        <P>
          Quando você envia um comprovante para análise, o arquivo (ou extrato
          derivado) pode ser processado por provedor de IA para extrair valor, data e
          categoria. Esse processamento ocorre para{" "}
          <strong>prestar o serviço que você solicitou</strong>. Não utilizamos seus
          comprovantes para treinar modelos de forma que os exponha publicamente, além
          do estritamente necessário ao funcionamento do recurso e às políticas do
          fornecedor de IA.
        </P>
        <P>
          Você deve revisar sempre o resultado da IA antes de confiar nos lançamentos.
        </P>
      </section>

      <section>
        <H2>6. Exceções legais</H2>
        <P>
          Poderemos revelar informações confidenciais se formos obrigados por lei,
          ordem judicial ou autoridade competente, ou para proteger direitos, segurança
          e integridade do LucroMEI, de usuários ou de terceiros, na medida estritamente
          necessária.
        </P>
      </section>

      <section>
        <H2>7. Suas responsabilidades</H2>
        <Ul
          items={[
            "Não compartilhar login e senha",
            "Cuidar do dispositivo e das capturas de tela que você mesmo divulgar",
            "Não enviar dados de terceiros sem base legal ou autorização",
            "Sair da conta em computadores compartilhados",
          ]}
        />
      </section>

      <section>
        <H2>8. Equipe e prestadores</H2>
        <P>
          Em fase de MVP, o atendimento e a operação podem ser feitos diretamente pela
          titular do projeto e por prestadores técnicos sob dever de sigilo compatível
          com esta política.
        </P>
      </section>

      <section>
        <H2>9. Vigência</H2>
        <P>
          As obrigações de confidencialidade relativas aos seus dados permanecem
          enquanto mantivermos os dados e, após a exclusão, na medida exigida por lei
          ou para defesa de direitos.
        </P>
      </section>

      <section>
        <H2>10. Contato</H2>
        <P>
          Questões sobre sigilo e confidencialidade:{" "}
          <a href="/contato" className="text-emerald-700 underline">
            Contato
          </a>
          .
        </P>
      </section>
    </LegalShell>
  );
}
