"use client";

import { useEffect } from "react";

declare global {
  interface Window {
    $crisp?: unknown[];
    CRISP_WEBSITE_ID?: string;
  }
}

export interface PropriedadesChatCrisp {
  readonly emailUsuario?: string | null;
  readonly nomeUsuario?: string | null;
}

const ID_WEBSITE_CRISP = "294e744c-e84e-4664-a2e2-3f2e764467d6";

export function ChatCrisp({ emailUsuario, nomeUsuario }: PropriedadesChatCrisp = {}) {
  useEffect(() => {
    if (typeof window === "undefined") return;

    window.$crisp = window.$crisp || [];
    window.CRISP_WEBSITE_ID = ID_WEBSITE_CRISP;

    if (!document.getElementById("script-widget-crisp")) {
      const script = document.createElement("script");
      script.id = "script-widget-crisp";
      script.src = "https://client.crisp.chat/l.js";
      script.async = true;
      document.head.appendChild(script);
    }

    // Configura identificação do usuário quando logado no painel
    if (emailUsuario) {
      window.$crisp.push(["set", "user:email", [emailUsuario]]);
    }
    if (nomeUsuario) {
      window.$crisp.push(["set", "user:nickname", [nomeUsuario]]);
    }

    // Garante que o widget fica visível ao carregar na home ou no painel
    window.$crisp.push(["do", "chat:show"]);

    return () => {
      try {
        // Oculta o chat caso o usuário saia das rotas oficiais (ex: para vitrine pública do cliente)
        window.$crisp?.push(["do", "chat:hide"]);
      } catch {
        // Ignora caso o script Crisp ainda não esteja pronto
      }
    };
  }, [emailUsuario, nomeUsuario]);

  return null;
}

