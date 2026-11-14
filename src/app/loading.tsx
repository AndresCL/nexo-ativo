import { BarraProgressoHorizontalDiscreta } from "@/componentes/interface/BarraProgressoHorizontalDiscreta";

export default function CarregandoRaiz() {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0f1110]">
      <BarraProgressoHorizontalDiscreta variante="em_linha" className="w-28 sm:w-32" />
    </div>
  );
}
