import { politicaAdvocaciaOab } from "./politicaAdvocaciaOab";
import { politicaMedicinaCfm } from "./politicaMedicinaCfm";
import { politicaOdontologiaCfo } from "./politicaOdontologiaCfo";
import { politicaPadrao } from "./politicaPadrao";
import {
  CODIGO_PERFIL_PUBLICIDADE_PADRAO,
  ehCodigoPerfilPublicidade,
  type CodigoPerfilPublicidade,
  type PoliticaPublicidade,
} from "./tiposPerfilPublicidade";

const POLITICAS: Readonly<Record<CodigoPerfilPublicidade, PoliticaPublicidade>> = {
  padrao: politicaPadrao,
  advocacia_oab: politicaAdvocaciaOab,
  medicina_cfm: politicaMedicinaCfm,
  odontologia_cfo: politicaOdontologiaCfo,
};

export const POLITICAS_PUBLICIDADE_DISPONIVEIS: readonly PoliticaPublicidade[] =
  Object.values(POLITICAS);

/** Resolve a política do perfil; valor ausente ou desconhecido equivale ao perfil padrão. */
export function obterPoliticaPublicidade(codigo: unknown): PoliticaPublicidade {
  return ehCodigoPerfilPublicidade(codigo)
    ? POLITICAS[codigo]
    : POLITICAS[CODIGO_PERFIL_PUBLICIDADE_PADRAO];
}
