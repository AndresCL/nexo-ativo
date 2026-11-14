import type { OpcoesDownloadArquivo } from "@/dominio/solicitacoes/exportacao/tiposExportacaoSolicitacoes";

/**
 * Dispara o download de um arquivo gerado em memória diretamente pelo navegador.
 * Limpa o objeto URL alocado para evitar vazamentos de memória.
 */
export function baixarArquivoNavegador(opcoes: OpcoesDownloadArquivo): void {
  if (typeof window === "undefined" || !document) {
    return;
  }

  const blob =
    opcoes.conteudo instanceof Blob
      ? opcoes.conteudo
      : new Blob([opcoes.conteudo], { type: opcoes.tipoMime });

  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = opcoes.nomeArquivo;
  link.style.display = "none";

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  setTimeout(() => {
    URL.revokeObjectURL(url);
  }, 1000);
}

