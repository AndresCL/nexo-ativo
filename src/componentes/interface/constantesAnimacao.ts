/**
 * Tokens de temporização e curvas de transição do ecossistema Fluxo.
 * Segue o Princípio da Responsabilidade Única (SRP) centralizando a física visual da aplicação.
 */

/**
 * Curva Bézier característica do design editorial (Quint / Cubic Out refinada).
 * Proporciona aceleração rápida e desaceleração suave sem efeito elástico artificial.
 */
export const CURVA_EDITORIAL = [0.22, 1, 0.36, 1] as const;

/**
 * Curva padrão para microinterações e alternâncias rápidas.
 */
export const CURVA_SUAVE = [0.25, 0.1, 0.25, 1] as const;

/**
 * Durações padronizadas em segundos (compatíveis com motion/react).
 */
export const DURACOES_SEGUNDOS = {
  microinteracao: 0.18,
  painel: 0.28,
  transicaoEtapa: 0.32,
  entradaEditorial: 0.45,
  colapsavel: 0.3,
} as const;

/**
 * Durações padronizadas em milissegundos para transições CSS e Radix UI.
 */
export const DURACOES_MS = {
  microinteracao: 180,
  painel: 280,
  transicaoEtapa: 320,
  entradaEditorial: 450,
  colapsavel: 300,
} as const;
