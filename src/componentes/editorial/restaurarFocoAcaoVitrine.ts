/** Encontra a cópia visível do acionador quando o contêiner mudou de tamanho. */
export function restaurarFocoAcaoVitrine(acionador: HTMLButtonElement | null): void {
  if (!acionador) return;
  const id = acionador.dataset.acaoHomeId;
  const candidatos = document.querySelectorAll<HTMLButtonElement>("button[data-acao-home-id]");
  const visivel = [...candidatos].find(
    (botao) => botao.dataset.acaoHomeId === id && botao.getClientRects().length > 0,
  );
  if (visivel) {
    visivel.focus();
    return;
  }
  const composicao = acionador.closest<HTMLElement>("[data-composicao]");
  if (composicao?.isConnected) {
    composicao.tabIndex = -1;
    composicao.focus();
  }
}
