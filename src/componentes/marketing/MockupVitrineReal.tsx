import Image from "next/image";
import {
  Building2,
  Calculator,
  Calendar,
  Car,
  ChevronRight,
  Clock,
  Compass,
  DollarSign,
  FileText,
  Globe,
  HelpCircle,
  Home,
  KeyRound,
  MapPin,
  Phone,
  Play,
  Shield,
  Smartphone,
  Sparkles,
  Star,
  Stethoscope,
  Users,
  Wrench,
} from "lucide-react";
import { IconeWhatsapp } from "@/componentes/interface/IconeWhatsapp";
import { combinarClasses } from "@/utilitarios/combinarClasses";

export type TipoIconeAcaoVitrine =
  | "sparkle"
  | "servico"
  | "agenda"
  | "whatsapp"
  | "escudo"
  | "sobre"
  | "localizacao"
  | "compasso"
  | "casa"
  | "saude"
  | "relogio"
  | "proposta"
  | "obras"
  | "equipe"
  | "calculadora"
  | "carro"
  | "cifrao"
  | "chave";

export type TipoLogoFicticio = "horizonte" | "helena" | "lumina" | "vertice" | "casanobre";

export type EstiloCabecalhoVitrine =
  | "somente_logo"
  | "somente_texto"
  | "logo_sem_barra"
  | "logo_com_barra";

export interface AcaoCartaoVitrineFicticia {
  readonly titulo: string;
  readonly subtitulo?: string;
  readonly icone: TipoIconeAcaoVitrine;
}

export interface ItemServicoFotoVitrine {
  readonly categoria: string;
  readonly titulo: string;
  readonly subtitulo: string;
  readonly rodape: string;
  readonly imagemSrc: string;
  readonly imagemAlt: string;
}

export interface BlocoEquipeAvataresVitrine {
  readonly titulo: string;
  readonly subtitulo: string;
  readonly avatares: readonly string[];
}

export interface BlocoVideoVitrine {
  readonly capaPrincipalSrc: string;
  readonly capaPrincipalAlt: string;
  readonly capaSecundariaSrc: string;
}

export interface AvaliacaoGoogleVitrine {
  readonly autor: string;
  readonly tempo: string;
  readonly comentario: string;
  readonly avatarSrc: string;
}

export interface DadosVitrineRealFicticia {
  readonly tema: "escuro" | "claro";
  readonly estiloCabecalho: EstiloCabecalhoVitrine;
  readonly logo: TipoLogoFicticio;
  readonly nomeMarcaTopo?: string;
  readonly subtituloTopo?: string;
  readonly imagemFundoSrc?: string;
  readonly imagemFundoAlt?: string;
  readonly destaqueFotoTopo?: boolean;
  readonly efeitoCantos?: "nenhum" | "dots";
  readonly estiloFundoInline?: React.CSSProperties;
  readonly classeFundoGradiente: string;
  readonly classeBotaoPrincipal: string;
  readonly classeCorLogo: string;
  readonly iconeBotaoPrincipal: TipoIconeAcaoVitrine;
  readonly tituloBotaoPrincipal: string;
  readonly subtituloBotaoPrincipal: string;
  readonly blocoEquipe?: BlocoEquipeAvataresVitrine;
  readonly blocoVideo?: BlocoVideoVitrine;
  readonly acoes: readonly AcaoCartaoVitrineFicticia[];
  readonly servicosFoto?: readonly ItemServicoFotoVitrine[];
  readonly avaliacoesGoogle?: readonly AvaliacaoGoogleVitrine[];
  readonly localizacao?: string;
  readonly telefoneFixo?: string;
  readonly telefoneMovel?: string;
  readonly horarioAtendimento?: string;
}

function renderizarLogoFicticio(
  tipo: TipoLogoFicticio,
  className: string,
  destacado = false,
) {
  switch (tipo) {
    case "horizonte":
      if (destacado) {
        return (
          <div className={combinarClasses("flex flex-col items-center gap-1.5", className)}>
            <svg viewBox="0 0 48 48" fill="none" aria-hidden="true" className="h-10 w-10">
              <path
                d="M24 4L42 14V34L24 44L6 34V14L24 4Z"
                fill="currentColor"
                fillOpacity="0.14"
                stroke="currentColor"
                strokeWidth="2.2"
              />
              <path
                d="M15 27L24 18L33 27M18.5 32H29.5"
                stroke="currentColor"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <span className="text-[11px] font-semibold tracking-[0.28em] uppercase">HORIZONTE</span>
          </div>
        );
      }
      return (
        <svg viewBox="0 0 32 32" fill="none" aria-hidden="true" className={className}>
          <path
            d="M16 3L28 9.5V22.5L16 29L4 22.5V9.5L16 3Z"
            fill="currentColor"
            fillOpacity="0.2"
            stroke="currentColor"
            strokeWidth="2.2"
          />
          <path
            d="M10 17.5L16 12L22 17.5M12.5 21H19.5"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      );
    case "casanobre":
      return (
        <div className={combinarClasses("flex flex-col items-center gap-1.5", className)}>
          {/* Monograma geométrico de alto padrão CN com pórtico arquitetônico */}
          <svg viewBox="0 0 44 40" fill="none" aria-hidden="true" className="h-10 w-11">
            <rect
              x="2"
              y="2"
              width="40"
              height="36"
              rx="4"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeOpacity="0.4"
            />
            {/* Frontão arquitetônico sutil */}
            <path
              d="M10 13L22 6L34 13"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            {/* Colunata central CN */}
            <path
              d="M16 19V30M28 19V30M16 24.5H28"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            />
            <circle cx="22" cy="18" r="1.5" fill="currentColor" />
          </svg>
          <span className="text-[10px] font-bold tracking-[0.28em] text-white uppercase">
            CASA NOBRE
          </span>
          <span className="text-[7.5px] font-medium tracking-[0.22em] text-sky-200/80 uppercase">
            IMÓVEIS EXCLUSIVOS
          </span>
        </div>
      );
    case "helena":
      return (
        <svg viewBox="0 0 32 32" fill="none" aria-hidden="true" className={className}>
          <circle cx="16" cy="16" r="12" stroke="currentColor" strokeWidth="2" />
          <path
            d="M12 10.5V21.5M20 10.5V21.5M12 16H20"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </svg>
      );
    case "lumina":
      return (
        <div className="flex items-center gap-2">
          {/* Emblema prismático de alta precisão estética e odontologia */}
          <svg viewBox="0 0 36 36" fill="none" aria-hidden="true" className="h-8 w-8 shrink-0">
            <defs>
              <linearGradient id="degradado-logo-lumina" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#0284c7" />
                <stop offset="50%" stopColor="#38bdf8" />
                <stop offset="100%" stopColor="#0ea5e9" />
              </linearGradient>
            </defs>
            <rect
              x="3"
              y="3"
              width="30"
              height="30"
              rx="9"
              fill="url(#degradado-logo-lumina)"
              fillOpacity="0.16"
              stroke="url(#degradado-logo-lumina)"
              strokeWidth="1.5"
            />
            {/* Estrela de luminosidade em facetas */}
            <path
              d="M18 7L19.8 14.2L27 16L19.8 17.8L18 25L16.2 17.8L9 16L16.2 14.2L18 7Z"
              fill="url(#degradado-logo-lumina)"
            />
            <circle cx="18" cy="16" r="1.8" fill="#ffffff" />
          </svg>
        </div>
      );
    case "vertice":
      return (
        <svg viewBox="0 0 32 32" fill="none" aria-hidden="true" className={className}>
          <path
            d="M6 9L16 25L26 9"
            stroke="currentColor"
            strokeWidth="2.6"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M11.5 9L16 16.5L20.5 9"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeOpacity="0.55"
          />
        </svg>
      );
  }
}

function renderizarIcone(icone: TipoIconeAcaoVitrine, className: string) {
  switch (icone) {
    case "sparkle":
      return <Sparkles className={className} aria-hidden="true" />;
    case "servico":
      return <Wrench className={className} aria-hidden="true" />;
    case "agenda":
      return <Calendar className={className} aria-hidden="true" />;
    case "whatsapp":
      return <IconeWhatsapp className={className} aria-hidden="true" />;
    case "escudo":
      return <Shield className={className} aria-hidden="true" />;
    case "sobre":
      return <HelpCircle className={className} aria-hidden="true" />;
    case "localizacao":
      return <MapPin className={className} aria-hidden="true" />;
    case "compasso":
      return <Compass className={className} aria-hidden="true" />;
    case "casa":
      return <Home className={className} aria-hidden="true" />;
    case "saude":
      return <Stethoscope className={className} aria-hidden="true" />;
    case "relogio":
      return <Clock className={className} aria-hidden="true" />;
    case "proposta":
      return <FileText className={className} aria-hidden="true" />;
    case "obras":
      return <Building2 className={className} aria-hidden="true" />;
    case "equipe":
      return <Users className={className} aria-hidden="true" />;
    case "calculadora":
      return <Calculator className={className} aria-hidden="true" />;
    case "carro":
      return <Car className={className} aria-hidden="true" />;
    case "cifrao":
      return <DollarSign className={className} aria-hidden="true" />;
    case "chave":
      return <KeyRound className={className} aria-hidden="true" />;
  }
}

function renderizarCabecalho(dados: DadosVitrineRealFicticia, claro: boolean) {
  switch (dados.estiloCabecalho) {
    case "somente_logo":
      return (
        <div className="flex justify-center pt-1">
          {renderizarLogoFicticio(dados.logo, dados.classeCorLogo, true)}
        </div>
      );

    case "somente_texto":
      return (
        <div className="text-left">
          {dados.nomeMarcaTopo ? (
            <p className="text-lg leading-tight font-bold tracking-tight text-white">
              {dados.nomeMarcaTopo}
            </p>
          ) : null}
          {dados.subtituloTopo ? (
            <p className="mt-1 text-[10px] font-medium tracking-[0.18em] text-white/80 uppercase">
              {dados.subtituloTopo}
            </p>
          ) : null}
        </div>
      );

    case "logo_sem_barra":
      return (
        <div className="flex items-center justify-center gap-2.5">
          {renderizarLogoFicticio(
            dados.logo,
            combinarClasses("h-8 w-8 shrink-0", dados.classeCorLogo),
          )}
          <div className="text-left">
            {dados.nomeMarcaTopo ? (
              <p
                className={combinarClasses(
                  "text-xs leading-tight font-bold tracking-tight",
                  claro ? "text-mineral-950" : "text-white",
                )}
              >
                {dados.nomeMarcaTopo}
              </p>
            ) : null}
            {dados.subtituloTopo ? (
              <p
                className={combinarClasses(
                  "text-[9px] font-medium tracking-[0.16em] uppercase",
                  claro ? "text-neutral-500" : "text-white/80",
                )}
              >
                {dados.subtituloTopo}
              </p>
            ) : null}
          </div>
        </div>
      );

    case "logo_com_barra":
      return (
        <div className="flex items-center justify-center gap-3">
          {renderizarLogoFicticio(
            dados.logo,
            combinarClasses("h-7 w-7 shrink-0", dados.classeCorLogo),
          )}
          <span
            className={combinarClasses("h-5 w-px", claro ? "bg-neutral-300" : "bg-white/25")}
            aria-hidden="true"
          />
          <div className="text-left">
            {dados.nomeMarcaTopo ? (
              <p
                className={combinarClasses(
                  "text-xs leading-tight font-bold tracking-tight",
                  claro ? "text-mineral-950" : "text-white",
                )}
              >
                {dados.nomeMarcaTopo}
              </p>
            ) : null}
            {dados.subtituloTopo ? (
              <p
                className={combinarClasses(
                  "text-[9px] font-medium tracking-[0.18em] uppercase",
                  claro ? "text-neutral-500" : "text-white/85",
                )}
              >
                {dados.subtituloTopo}
              </p>
            ) : null}
          </div>
        </div>
      );
  }
}

export interface PropriedadesMockupVitrineReal {
  readonly dados: DadosVitrineRealFicticia;
  readonly className?: string;
}

/**
 * Reproduz em proporção real de smartphone (9:19) as vitrines mobile do Nexo Ativo,
 * incluindo avatares da equipe, vídeos com play, serviços com foto e avaliações do Google.
 */
export function MockupVitrineReal({ dados, className }: PropriedadesMockupVitrineReal) {
  const claro = dados.tema === "claro";
  const textoAbaixoDaFoto = dados.destaqueFotoTopo === true;
  const temEfeitoCantosDots = dados.efeitoCantos === "dots";

  return (
    <div
      style={dados.estiloFundoInline}
      className={combinarClasses(
        "relative mx-auto w-[296px] shrink-0 overflow-hidden rounded-[2.25rem] border shadow-[0_24px_60px_-20px_rgba(15,17,16,0.32)] sm:w-[304px]",
        claro ? "border-neutral-300 text-mineral-950" : "border-neutral-300/80 text-white",
        dados.classeFundoGradiente,
        className,
      )}
    >
      {/* Efeito Cantos Editorial (Dots nos 4 cantos idêntico ao app real) */}
      {temEfeitoCantosDots ? (
        <div
          aria-hidden="true"
          className={combinarClasses(
            "pointer-events-none absolute inset-0 z-0 select-none overflow-hidden",
            claro ? "opacity-45" : "opacity-35",
          )}
        >
          {/* Canto superior esquerdo */}
          <div
            className="absolute top-0 left-0 h-28 w-28"
            style={{
              backgroundImage: claro
                ? "radial-gradient(circle, #0284c7 1px, transparent 1px)"
                : "radial-gradient(circle, #38bdf8 1px, transparent 1px)",
              backgroundSize: "12px 12px",
              WebkitMaskImage: "radial-gradient(circle at 0% 0%, black 35%, transparent 75%)",
              maskImage: "radial-gradient(circle at 0% 0%, black 35%, transparent 75%)",
            }}
          />
          {/* Canto superior direito */}
          <div
            className="absolute top-0 right-0 h-28 w-28"
            style={{
              backgroundImage: claro
                ? "radial-gradient(circle, #0284c7 1px, transparent 1px)"
                : "radial-gradient(circle, #38bdf8 1px, transparent 1px)",
              backgroundSize: "12px 12px",
              WebkitMaskImage: "radial-gradient(circle at 100% 0%, black 35%, transparent 75%)",
              maskImage: "radial-gradient(circle at 100% 0%, black 35%, transparent 75%)",
            }}
          />
          {/* Canto inferior esquerdo */}
          <div
            className="absolute bottom-0 left-0 h-28 w-28"
            style={{
              backgroundImage: claro
                ? "radial-gradient(circle, #0284c7 1px, transparent 1px)"
                : "radial-gradient(circle, #38bdf8 1px, transparent 1px)",
              backgroundSize: "12px 12px",
              WebkitMaskImage: "radial-gradient(circle at 0% 100%, black 35%, transparent 75%)",
              maskImage: "radial-gradient(circle at 0% 100%, black 35%, transparent 75%)",
            }}
          />
          {/* Canto inferior direito */}
          <div
            className="absolute bottom-0 right-0 h-28 w-28"
            style={{
              backgroundImage: claro
                ? "radial-gradient(circle, #0284c7 1px, transparent 1px)"
                : "radial-gradient(circle, #38bdf8 1px, transparent 1px)",
              backgroundSize: "12px 12px",
              WebkitMaskImage: "radial-gradient(circle at 100% 100%, black 35%, transparent 75%)",
              maskImage: "radial-gradient(circle at 100% 100%, black 35%, transparent 75%)",
            }}
          />
        </div>
      ) : null}
      {/* Fotografia natural de fundo */}
      {dados.imagemFundoSrc ? (
        <div className="pointer-events-none absolute inset-0">
          <Image
            src={dados.imagemFundoSrc}
            alt={dados.imagemFundoAlt ?? ""}
            fill
            sizes="310px"
            className={combinarClasses(
              "object-cover",
              textoAbaixoDaFoto
                ? "object-[50%_12%] -translate-y-7 scale-[1.08]"
                : "object-top",
            )}
          />
          <div
            aria-hidden="true"
            className={combinarClasses(
              "absolute inset-0",
              textoAbaixoDaFoto
                ? "bg-gradient-to-b from-transparent via-mineral-950/15 via-45% to-mineral-950/95"
                : "bg-gradient-to-b from-mineral-950/45 via-mineral-950/45 to-mineral-950/95",
            )}
          />
        </div>
      ) : null}

      {/* Textura sutil de pontos quando não estiver usando efeitoCantos dots */}
      {!temEfeitoCantosDots && (!dados.imagemFundoSrc || claro) ? (
        <div
          aria-hidden="true"
          className={combinarClasses(
            "pointer-events-none absolute inset-0",
            claro ? "opacity-35" : "opacity-20",
          )}
          style={{
            backgroundImage: claro
              ? "radial-gradient(rgba(15,17,16,0.14) 0.75px, transparent 0.75px)"
              : "radial-gradient(rgba(255,255,255,0.28) 0.75px, transparent 0.75px)",
            backgroundSize: "14px 14px",
          }}
        />
      ) : null}

      <div className="relative flex min-h-[600px] flex-col justify-between px-5 pt-7 pb-5">
        {textoAbaixoDaFoto ? <div className="h-52" aria-hidden="true" /> : renderizarCabecalho(dados, claro)}

        <div className={combinarClasses("flex flex-col", textoAbaixoDaFoto ? "mt-auto" : "mt-5")}>
          {textoAbaixoDaFoto ? <div className="mb-4">{renderizarCabecalho(dados, claro)}</div> : null}

          {/* Faixa "Fale com a nossa equipe" com pill de avatares sobrepostos */}
          {dados.blocoEquipe ? (
            <div className="mb-3.5 flex items-center justify-between gap-2 text-left">
              <div className="min-w-0">
                <p
                  className={combinarClasses(
                    "truncate text-[11px] font-semibold",
                    claro ? "text-mineral-950" : "text-white",
                  )}
                >
                  {dados.blocoEquipe.titulo}
                </p>
                <p
                  className={combinarClasses(
                    "truncate text-[9.5px]",
                    claro ? "text-neutral-500" : "text-white/65",
                  )}
                >
                  {dados.blocoEquipe.subtitulo}
                </p>
              </div>
              <div className="flex shrink-0 items-center gap-1.5">
                <div className="flex -space-x-2">
                  {dados.blocoEquipe.avatares.map((src, indice) => (
                    <span
                      key={`${src}-${indice}`}
                      className="relative h-6 w-6 overflow-hidden rounded-full border border-white/80 bg-neutral-700"
                    >
                      <Image
                        src={src}
                        alt=""
                        fill
                        sizes="24px"
                        className="object-cover object-top"
                      />
                    </span>
                  ))}
                </div>
                <ChevronRight
                  className={combinarClasses(
                    "h-3.5 w-3.5",
                    claro ? "text-neutral-400" : "text-white/60",
                  )}
                  aria-hidden="true"
                />
              </div>
            </div>
          ) : null}

          {/* Botão principal em pílula (ícone e texto centralizados) */}
          <div>
            <div
              className={combinarClasses(
                "flex w-full items-center justify-center gap-2 rounded-full px-4 py-2.5 text-center text-xs font-semibold shadow-sm",
                dados.classeBotaoPrincipal,
              )}
            >
              <span className="inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-current/12">
                {renderizarIcone(dados.iconeBotaoPrincipal, "h-3 w-3 text-current")}
              </span>
              <span className="truncate">{dados.tituloBotaoPrincipal}</span>
            </div>
            <p
              className={combinarClasses(
                "mt-2 px-1 text-center text-[10px] leading-snug",
                claro ? "text-neutral-500" : "text-white/75",
              )}
            >
              {dados.subtituloBotaoPrincipal}
            </p>
          </div>

          {/* Carrossel de Vídeo com botão Play */}
          {dados.blocoVideo ? (
            <div className="mt-3.5 -mr-5 flex gap-2 overflow-hidden">
              <div className="relative aspect-[16/10] w-[82%] shrink-0 overflow-hidden rounded-2xl border border-white/10 bg-black">
                <Image
                  src={dados.blocoVideo.capaPrincipalSrc}
                  alt={dados.blocoVideo.capaPrincipalAlt}
                  fill
                  sizes="220px"
                  className="object-cover"
                />
                <div
                  aria-hidden="true"
                  className="absolute inset-0 flex items-center justify-center bg-black/20"
                >
                  <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-black/65 text-white backdrop-blur-xs">
                    <Play className="ml-0.5 h-4 w-4 fill-white" />
                  </span>
                </div>
              </div>
              <div
                aria-hidden="true"
                className="relative aspect-[16/10] w-[28%] shrink-0 overflow-hidden rounded-l-2xl border border-white/10 bg-black opacity-75"
              >
                <Image
                  src={dados.blocoVideo.capaSecundariaSrc}
                  alt=""
                  fill
                  sizes="80px"
                  className="object-cover"
                />
              </div>
            </div>
          ) : null}

          {/* Ações empilhadas — sempre alinhadas à esquerda */}
          <div className="mt-3.5 space-y-2">
            {dados.acoes.map((acao) => (
              <div
                key={acao.titulo}
                className={combinarClasses(
                  "flex items-center gap-3 rounded-xl border px-3 py-2.5",
                  claro
                    ? "border-neutral-200/90 bg-white shadow-2xs"
                    : "border-white/12 bg-black/40 backdrop-blur-md",
                )}
              >
                <span
                  className={combinarClasses(
                    "inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-lg",
                    claro ? "bg-neutral-100" : "bg-white/10",
                  )}
                >
                  {renderizarIcone(
                    acao.icone,
                    claro ? "h-3.5 w-3.5 text-mineral-900" : "h-3.5 w-3.5 text-white/90",
                  )}
                </span>
                <div className="min-w-0 flex-1 text-left">
                  <p
                    className={combinarClasses(
                      "truncate text-[11px] font-semibold",
                      claro ? "text-mineral-950" : "text-white",
                    )}
                  >
                    {acao.titulo}
                  </p>
                  {acao.subtitulo ? (
                    <p
                      className={combinarClasses(
                        "mt-0.5 line-clamp-2 text-[9.5px] leading-tight",
                        claro ? "text-neutral-500" : "text-white/70",
                      )}
                    >
                      {acao.subtitulo}
                    </p>
                  ) : null}
                </div>
                <ChevronRight
                  className={combinarClasses(
                    "h-3.5 w-3.5 shrink-0",
                    claro ? "text-neutral-400" : "text-white/55",
                  )}
                  aria-hidden="true"
                />
              </div>
            ))}
          </div>

          {/* Carrossel de Avaliações do Google */}
          {dados.avaliacoesGoogle && dados.avaliacoesGoogle.length > 0 ? (
            <div className="mt-3.5 -mr-5 flex gap-2 overflow-hidden">
              {dados.avaliacoesGoogle.map((avaliacao, indice) => (
                <div
                  key={avaliacao.autor}
                  className={combinarClasses(
                    "shrink-0 rounded-2xl border border-white/12 bg-black/45 p-3 text-left backdrop-blur-md",
                    indice === 0 ? "w-[82%]" : "w-[36%] opacity-65",
                  )}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex min-w-0 items-center gap-2">
                      <span className="relative h-6 w-6 shrink-0 overflow-hidden rounded-full bg-neutral-700">
                        <Image
                          src={avaliacao.avatarSrc}
                          alt=""
                          fill
                          sizes="24px"
                          className="object-cover object-top"
                        />
                      </span>
                      <div className="min-w-0">
                        <p className="truncate text-[10px] font-semibold text-white">
                          {avaliacao.autor}
                        </p>
                        <div
                          aria-label="5 de 5 estrelas"
                          className="mt-0.5 flex items-center gap-0.5 text-amber-400"
                        >
                          {[0, 1, 2, 3, 4].map((estrela) => (
                            <Star
                              key={estrela}
                              className="h-2.5 w-2.5 fill-amber-400 text-amber-400"
                              aria-hidden="true"
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                    {indice === 0 ? (
                      <span className="shrink-0 text-[8.5px] text-white/50">{avaliacao.tempo}</span>
                    ) : null}
                  </div>
                  <p className="mt-2 line-clamp-2 text-[9.5px] leading-snug text-white/80">
                    {avaliacao.comentario}
                  </p>
                </div>
              ))}
            </div>
          ) : null}

          {/* Grade 2x2 de Serviços com fotos (quando presente) */}
          {dados.servicosFoto && dados.servicosFoto.length > 0 ? (
            <div className="mt-4">
              <div className="flex items-center justify-between text-[11px]">
                <span
                  className={combinarClasses("font-semibold", claro ? "text-mineral-950" : "text-white")}
                >
                  Serviços
                </span>
                <span className={claro ? "text-neutral-500" : "text-white/65"}>Ver todos</span>
              </div>
              <div className="mt-2 grid grid-cols-2 gap-2">
                {dados.servicosFoto.map((servico) => (
                  <div
                    key={servico.titulo}
                    className={combinarClasses(
                      "overflow-hidden rounded-xl border text-left",
                      claro ? "border-neutral-200 bg-white" : "border-white/10 bg-black/35",
                    )}
                  >
                    <div className="relative aspect-[4/3] w-full">
                      <Image
                        src={servico.imagemSrc}
                        alt={servico.imagemAlt}
                        fill
                        sizes="130px"
                        className="object-cover"
                      />
                      <span className="absolute top-1.5 left-1.5 rounded-full bg-black/60 px-2 py-0.5 text-[8px] font-medium text-white backdrop-blur-xs">
                        {servico.categoria}
                      </span>
                    </div>
                    <div className="p-2">
                      <p
                        className={combinarClasses(
                          "truncate text-[10px] font-semibold",
                          claro ? "text-mineral-950" : "text-white",
                        )}
                      >
                        {servico.titulo}
                      </p>
                      <p
                        className={combinarClasses(
                          "mt-0.5 truncate text-[8.5px]",
                          claro ? "text-neutral-500" : "text-white/65",
                        )}
                      >
                        {servico.subtitulo}
                      </p>
                      <p
                        className={combinarClasses(
                          "mt-1.5 text-[8.5px] font-semibold",
                          claro ? "text-mineral-950" : "text-white/90",
                        )}
                      >
                        {servico.rodape}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : !dados.avaliacoesGoogle && !dados.blocoVideo ? (
            <>
              <div className="mt-5 flex items-center justify-center gap-4 text-white/70" aria-hidden="true">
                <IconeWhatsapp className="h-3.5 w-3.5" />
                <Globe className="h-3.5 w-3.5" />
              </div>

              {dados.localizacao ? (
                <div className="mt-4 border-t border-white/12 pt-3 text-center text-[8.5px] tracking-[0.12em] text-white/70 uppercase">
                  <p className="inline-flex items-center justify-center gap-1">
                    <MapPin className="h-2.5 w-2.5 shrink-0" aria-hidden="true" />
                    <span>{dados.localizacao}</span>
                  </p>
                  {dados.telefoneFixo || dados.telefoneMovel ? (
                    <p className="mt-1 flex items-center justify-center gap-3">
                      {dados.telefoneFixo ? (
                        <span className="inline-flex items-center gap-1">
                          <Phone className="h-2.5 w-2.5 shrink-0" aria-hidden="true" />
                          {dados.telefoneFixo}
                        </span>
                      ) : null}
                      {dados.telefoneMovel ? (
                        <span className="inline-flex items-center gap-1">
                          <Smartphone className="h-2.5 w-2.5 shrink-0" aria-hidden="true" />
                          {dados.telefoneMovel}
                        </span>
                      ) : null}
                    </p>
                  ) : null}
                  {dados.horarioAtendimento ? (
                    <p className="mt-1 text-white/55">{dados.horarioAtendimento}</p>
                  ) : null}
                </div>
              ) : null}
            </>
          ) : null}
        </div>
      </div>
    </div>
  );
}
