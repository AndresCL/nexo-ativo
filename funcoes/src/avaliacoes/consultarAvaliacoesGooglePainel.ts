import type { Firestore } from "firebase-admin/firestore";
import type { UsuarioAutenticado } from "../../../src/dominio/entidades/autenticacaoEOrganizacao";
import type { PortaProvedorAvaliacoesGoogle } from "../../../src/aplicacao/portas/portasAvaliacoesGoogle";
import {
  esquemaPesquisaEstabelecimentosGoogle,
  esquemaConsultaAvaliacoesGooglePrevia,
} from "../../../src/validacoes/esquemasAvaliacoesGoogle";
import { carregarEValidarAcessoOrganizacao } from "../seguranca/autorizadorAdminFirestore";
import { reservarConsultaAvaliacoesGoogle } from "./limitadorConsultasAvaliacoesGoogle";

export async function executarPesquisaEstabelecimentosGoogle(
  bancoDados: Firestore,
  usuario: UsuarioAutenticado | null,
  entrada: unknown,
  provedor: PortaProvedorAvaliacoesGoogle,
  reservarConsulta = reservarConsultaAvaliacoesGoogle,
) {
  const dados = esquemaPesquisaEstabelecimentosGoogle.parse(entrada);
  await carregarEValidarAcessoOrganizacao(
    bancoDados,
    usuario,
    dados.organizacaoId,
    "editar_aparencia_e_conteudo",
  );
  await reservarConsulta(bancoDados, dados.organizacaoId);
  return provedor.pesquisarEstabelecimentos(dados.consulta);
}

export async function executarConsultaAvaliacoesGooglePrevia(
  bancoDados: Firestore,
  usuario: UsuarioAutenticado | null,
  entrada: unknown,
  provedor: PortaProvedorAvaliacoesGoogle,
  reservarConsulta = reservarConsultaAvaliacoesGoogle,
) {
  const dados = esquemaConsultaAvaliacoesGooglePrevia.parse(entrada);
  await carregarEValidarAcessoOrganizacao(
    bancoDados,
    usuario,
    dados.organizacaoId,
    "editar_aparencia_e_conteudo",
  );
  await reservarConsulta(bancoDados, dados.organizacaoId);
  return provedor.consultarAvaliacoes(dados.identificadorLocal);
}
