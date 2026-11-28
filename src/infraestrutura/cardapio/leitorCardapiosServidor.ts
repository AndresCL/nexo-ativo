import {
  ordenarCardapiosAtivos,
  ordenarPaginasCardapio,
  type CardapioOrganizacao,
} from "@/dominio/entidades/cardapioDigital";
import { obterServicosAdminFirebase } from "@/infraestrutura/firebase/adminFirebase";
import { esquemaCardapioOrganizacao } from "@/validacoes/esquemasCardapioDigital";

export async function listarCardapiosOrganizacaoServidor(
  organizacaoId: string,
): Promise<readonly CardapioOrganizacao[]> {
  const { bancoDadosAdmin } = obterServicosAdminFirebase();
  const snap = await bancoDadosAdmin
    .collection("organizacoes")
    .doc(organizacaoId)
    .collection("cardapios")
    .get();

  const itens: CardapioOrganizacao[] = [];
  for (const documento of snap.docs) {
    const validacao = esquemaCardapioOrganizacao.safeParse(documento.data());
    if (validacao.success) {
      itens.push({
        ...validacao.data,
        paginas: ordenarPaginasCardapio(validacao.data.paginas),
      });
    }
  }

  return itens.sort((a, b) => a.ordemExibicao - b.ordemExibicao || a.id.localeCompare(b.id));
}

export async function listarCardapiosPublicosServidor(
  organizacaoId: string,
): Promise<readonly CardapioOrganizacao[]> {
  const todos = await listarCardapiosOrganizacaoServidor(organizacaoId);
  return ordenarCardapiosAtivos(todos);
}

