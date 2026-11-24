import { collection, onSnapshot, query, where } from "firebase/firestore";
import type {
  DesinscreverAssinatura,
  ObservadorDeltaColecao,
  ParametrosObservacaoDeltaOrganizacao,
  PortaObservacaoDeltaColecao,
} from "@/aplicacao/portas/portasReatividade";
import { aguardarProntidaoAuthCliente } from "@/infraestrutura/firebase/aguardarProntidaoAuthCliente";
import { obterServicosClienteFirebase } from "@/infraestrutura/firebase/clienteFirebase";

export interface OpcoesObservadorDeltaColecaoFirestore<TItem> {
  readonly nomeSubcolecao: string;
  readonly converterDocumento: (dadosBrutos: unknown) => TItem | null;
  readonly verificarAuthPronta?: () => Promise<boolean>;
}

export class ObservadorDeltaColecaoFirestore<TItem>
  implements PortaObservacaoDeltaColecao<TItem>
{
  private readonly nomeSubcolecao: string;
  private readonly converterDocumento: (dadosBrutos: unknown) => TItem | null;
  private readonly verificarAuthPronta: () => Promise<boolean>;

  public constructor(opcoes: OpcoesObservadorDeltaColecaoFirestore<TItem>) {
    this.nomeSubcolecao = opcoes.nomeSubcolecao;
    this.converterDocumento = opcoes.converterDocumento;
    this.verificarAuthPronta = opcoes.verificarAuthPronta ?? aguardarProntidaoAuthCliente;
  }

  public assinarDelta(
    parametros: ParametrosObservacaoDeltaOrganizacao,
    observador: ObservadorDeltaColecao<TItem>,
  ): DesinscreverAssinatura {
    let cancelado = false;
    let desinscreverFirestore: DesinscreverAssinatura | null = null;

    void this.verificarAuthPronta().then((autenticado) => {
      if (cancelado) {
        return;
      }

      if (!autenticado) {
        observador.aoErro?.(
          new Error("Sessão cliente do Firebase indisponível para sincronização em tempo real."),
        );
        return;
      }

      try {
        const { bancoDados } = obterServicosClienteFirebase();
        const refColecao = collection(
          bancoDados,
          "organizacoes",
          parametros.organizacaoId,
          this.nomeSubcolecao,
        );

        const consulta = parametros.atualizadoAPartirDeIso
          ? query(refColecao, where("atualizadoEmIso", ">=", parametros.atualizadoAPartirDeIso))
          : query(refColecao, where("atualizadoEmIso", ">", ""));

        desinscreverFirestore = onSnapshot(
          consulta,
          (snapshot) => {
            if (cancelado) {
              return;
            }

            const itensValidos: TItem[] = [];
            for (const documento of snapshot.docs) {
              const convertido = this.converterDocumento(documento.data());
              if (convertido !== null) {
                itensValidos.push(convertido);
              }
            }

            observador.aoReceberDelta(itensValidos, {
              temEscritasPendentes: snapshot.metadata.hasPendingWrites,
            });
          },
          (erro) => {
            if (cancelado) {
              return;
            }
            observador.aoErro?.(erro instanceof Error ? erro : new Error(String(erro)));
          },
        );
      } catch (erro) {
        observador.aoErro?.(erro instanceof Error ? erro : new Error(String(erro)));
      }
    });

    return () => {
      cancelado = true;
      if (desinscreverFirestore) {
        desinscreverFirestore();
        desinscreverFirestore = null;
      }
    };
  }
}

