import type { ReactNode } from "react";
import type { LinkRedeSocial, TipoRedeSocial } from "@/dominio/entidades/paginaPublicada";
import {
  resolverTamanhoRedesSociais,
  type TamanhoRedesSociais,
} from "@/dominio/editorial/configuracaoRedesSociais";
import { IconeWhatsapp } from "@/componentes/interface/IconeWhatsapp";
import { combinarClasses } from "@/utilitarios/combinarClasses";

interface EscalaIconesRedesSociais {
  readonly icone: string;
  readonly behance: string;
  readonly pinterest: string;
  readonly link: string;
  readonly lista: string;
}

const ESCALAS_ICON_REDES_SOCIAIS: Readonly<Record<TamanhoRedesSociais, EscalaIconesRedesSociais>> =
{
  pequeno: {
    icone: "h-4.5 w-4.5",
    behance: "text-xs",
    pinterest: "text-[15px]",
    link: "min-h-11 min-w-11",
    lista: "gap-1.5",
  },
  medio: {
    icone: "h-6 w-6",
    behance: "text-sm",
    pinterest: "text-lg",
    link: "min-h-11 min-w-11",
    lista: "gap-2",
  },
  grande: {
    icone: "h-8 w-8",
    behance: "text-base",
    pinterest: "text-2xl",
    link: "min-h-12 min-w-12",
    lista: "gap-2.5",
  },
};

const NOMES_PADRAO_REDE: Readonly<Record<TipoRedeSocial, string>> = {
  instagram: "Instagram",
  linkedin: "LinkedIn",
  youtube: "YouTube",
  tiktok: "TikTok",
  facebook: "Facebook",
  pinterest: "Pinterest",
  behance: "Behance",
  whatsapp: "WhatsApp",
  site: "Site oficial",
};

function renderizarIconeRedeSocial(
  rede: TipoRedeSocial,
  escala: EscalaIconesRedesSociais,
): ReactNode {
  switch (rede) {
    case "instagram":
      return (
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.6"
          className={escala.icone}
          aria-hidden="true"
        >
          <rect x="3" y="3" width="18" height="18" rx="5" />
          <circle cx="12" cy="12" r="4" />
          <circle cx="17.5" cy="6.5" r="0.8" fill="currentColor" stroke="none" />
        </svg>
      );
    case "linkedin":
      return (
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.6"
          className={escala.icone}
          aria-hidden="true"
        >
          <rect x="3" y="3" width="18" height="18" rx="3" />
          <path d="M8 11v5M8 8v.01M12 16v-5c0-1.1.9-2 2-2s2 .9 2 2v5" />
        </svg>
      );
    case "youtube":
      return (
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.6"
          className={escala.icone}
          aria-hidden="true"
        >
          <rect x="2.5" y="5.5" width="19" height="13" rx="3.5" />
          <polygon points="10,9 15.5,12 10,15" fill="currentColor" stroke="none" />
        </svg>
      );
    case "whatsapp":
      return <IconeWhatsapp className={escala.icone} aria-hidden="true" />;
    case "behance":
      return (
        <span
          aria-hidden="true"
          className={combinarClasses("font-semibold tracking-tight", escala.behance)}
        >
          Bē
        </span>
      );
    case "pinterest":
      return (
        <span
          aria-hidden="true"
          className={combinarClasses("font-editorial font-semibold italic", escala.pinterest)}
        >
          P
        </span>
      );
    case "tiktok":
      return (
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.6"
          className={escala.icone}
          aria-hidden="true"
        >
          <path d="M14 4v10.5a3.5 3.5 0 1 1-3-3.46M14 4c.8 2.2 2.5 3.7 5 4" />
        </svg>
      );
    case "facebook":
      return (
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.6"
          className={escala.icone}
          aria-hidden="true"
        >
          <path d="M15 4h-2.5A3.5 3.5 0 0 0 9 7.5V10H6.5v3.5H9V20h3.8v-6.5h2.7l.5-3.5h-3.2V7.8c0-.6.4-1 1-1H15V4Z" />
        </svg>
      );
    case "site":
      return (
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.6"
          className={escala.icone}
          aria-hidden="true"
        >
          <circle cx="12" cy="12" r="9" />
          <path d="M3.5 12h17M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18" />
        </svg>
      );
  }
}

export interface PropriedadesBarraRedesSociaisDiscreta {
  readonly redes: readonly LinkRedeSocial[];
  readonly tamanho?: TamanhoRedesSociais;
  readonly alinharCentroNoMobile?: boolean;
  readonly className?: string;
  readonly acaoFinal?: ReactNode;
}

export function BarraRedesSociaisDiscreta({
  redes,
  tamanho,
  alinharCentroNoMobile = true,
  className,
  acaoFinal,
}: PropriedadesBarraRedesSociaisDiscreta) {
  if (redes.length === 0 && !acaoFinal) {
    return null;
  }

  const tamanhoResolvido = resolverTamanhoRedesSociais(tamanho);
  const escala = ESCALAS_ICON_REDES_SOCIAIS[tamanhoResolvido];

  return (
    <ul
      aria-label="Redes sociais e canais externos"
      data-tamanho-redes={tamanhoResolvido}
      className={combinarClasses(
        "flex flex-wrap items-center",
        escala.lista,
        alinharCentroNoMobile ? "justify-center @5xl:justify-start" : "justify-start",
        className,
      )}
    >
      {redes.map((item) => {
        const rotulo = item.rotuloAcessivel?.trim() || NOMES_PADRAO_REDE[item.rede];

        return (
          <li key={item.id}>
            <a
              href={item.url}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={rotulo}
              title={rotulo}
              className={combinarClasses(
                "inline-flex items-center justify-center rounded-full text-[var(--editorial-texto-secundario)] transition-colors duration-150 hover:text-[var(--editorial-texto)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--editorial-texto)]",
                escala.link,
              )}
            >
              {renderizarIconeRedeSocial(item.rede, escala)}
            </a>
          </li>
        );
      })}
      {acaoFinal ? (
        <>
          {redes.length > 0 ? (
            <li
              aria-hidden="true"
              className="mx-1.5 h-5 w-[2px] shrink-0 rounded-full bg-[var(--editorial-texto-secundario)]/50"
            />
          ) : null}
          <li>{acaoFinal}</li>
        </>
      ) : null}
    </ul>
  );
}
