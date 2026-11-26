import type { ReactNode } from "react";
import { Clock, MapPin, Phone, Smartphone } from "lucide-react";
import type { IdentidadeMarcaEditorial } from "@/dominio/entidades/paginaPublicada";
import { combinarClasses } from "@/utilitarios/combinarClasses";

export interface PropriedadesRodapeEditorial {
  readonly identidade: IdentidadeMarcaEditorial;
  readonly className?: string;
  readonly children?: ReactNode;
}

export function RodapeEditorial({ identidade, className, children }: PropriedadesRodapeEditorial) {
  const urlMapa =
    identidade.urlMapaEnderecoOpcional ||
    (identidade.cidadeEstado
      ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(identidade.cidadeEstado)}`
      : undefined);

  const temMetadados = Boolean(
    identidade.cidadeEstado ||
    identidade.telefonePrincipalOpcional ||
    identidade.celularOpcional ||
    identidade.horarioFuncionamentoOpcional ||
    identidade.registroProfissionalOpcional ||
    children,
  );

  if (!temMetadados) {
    return null;
  }

  return (
    <footer
      aria-label="Informações institucionais e contato"
      className={combinarClasses(
        "flex flex-col items-center justify-center text-center sm:flex-row sm:justify-between sm:text-left gap-3 text-[11px] font-medium tracking-[0.12em] text-[var(--editorial-texto)]/75 uppercase",
        className,
      )}
    >
      <div className="flex flex-wrap items-center justify-center sm:justify-start gap-x-2.5 gap-y-1.5">
        {identidade.cidadeEstado ? (
          urlMapa ? (
            <a
              href={urlMapa}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`Ver endereço no Google Maps: ${identidade.cidadeEstado}`}
              className="group inline-flex min-h-[44px] items-center gap-1.5 py-2 transition-colors hover:text-[var(--editorial-texto)] hover:underline"
            >
              <MapPin
                className="h-3.5 w-3.5 shrink-0 opacity-70 transition-opacity group-hover:opacity-100"
                aria-hidden="true"
              />
              <span>{identidade.cidadeEstado}</span>
            </a>
          ) : (
            <span className="inline-flex items-center gap-1.5">
              <MapPin className="h-3.5 w-3.5 shrink-0 opacity-70" aria-hidden="true" />
              <span>{identidade.cidadeEstado}</span>
            </span>
          )
        ) : null}

        {identidade.cidadeEstado && identidade.telefonePrincipalOpcional ? (
          <span aria-hidden="true" className="opacity-35 select-none">
            ·
          </span>
        ) : null}

        {identidade.telefonePrincipalOpcional ? (
          <a
            href={`tel:${identidade.telefonePrincipalOpcional.replace(/[^\d+]/g, "")}`}
            aria-label={`Ligar para ${identidade.telefonePrincipalOpcional}`}
            className="group inline-flex min-h-[44px] items-center gap-1.5 py-2 transition-colors hover:text-[var(--editorial-texto)] hover:underline"
          >
            <Phone
              className="h-3.5 w-3.5 shrink-0 opacity-70 transition-opacity group-hover:opacity-100"
              aria-hidden="true"
            />
            <span>{identidade.telefonePrincipalOpcional}</span>
          </a>
        ) : null}

        {(identidade.cidadeEstado || identidade.telefonePrincipalOpcional) &&
        identidade.celularOpcional ? (
          <span aria-hidden="true" className="opacity-35 select-none">
            ·
          </span>
        ) : null}

        {identidade.celularOpcional ? (
          <a
            href={`tel:${identidade.celularOpcional.replace(/[^\d+]/g, "")}`}
            aria-label={`Ligar para o celular ${identidade.celularOpcional}`}
            className="group inline-flex min-h-[44px] items-center gap-1.5 py-2 transition-colors hover:text-[var(--editorial-texto)] hover:underline"
          >
            <Smartphone
              className="h-3.5 w-3.5 shrink-0 opacity-70 transition-opacity group-hover:opacity-100"
              aria-hidden="true"
            />
            <span>{identidade.celularOpcional}</span>
          </a>
        ) : null}

        {(identidade.cidadeEstado ||
          identidade.telefonePrincipalOpcional ||
          identidade.celularOpcional) &&
        identidade.horarioFuncionamentoOpcional ? (
          <span aria-hidden="true" className="opacity-35 select-none">
            ·
          </span>
        ) : null}

        {identidade.horarioFuncionamentoOpcional ? (
          <span
            className="inline-flex items-center gap-1.5"
            title={identidade.horarioFuncionamentoOpcional}
          >
            <Clock className="h-3.5 w-3.5 shrink-0 opacity-70" aria-hidden="true" />
            <span>{identidade.horarioFuncionamentoOpcional}</span>
          </span>
        ) : null}

        {identidade.registroProfissionalOpcional ? (
          <>
            <span aria-hidden="true" className="opacity-35 select-none">
              ·
            </span>
            <span>{identidade.registroProfissionalOpcional}</span>
          </>
        ) : null}
      </div>

      {children ? <div className="flex items-center gap-3">{children}</div> : null}
    </footer>
  );
}
