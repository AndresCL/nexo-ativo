/**
 * Paleta de cores contrastantes e acessíveis para visualização de múltiplas experiências no gráfico.
 */
export const PALETA_CORES_EXPERIENCIAS = [
  { borda: "#0284c7", fundoBadge: "bg-sky-50 text-sky-700 border-sky-200" }, // Sky
  { borda: "#059669", fundoBadge: "bg-emerald-50 text-emerald-700 border-emerald-200" }, // Emerald
  { borda: "#7c3aed", fundoBadge: "bg-purple-50 text-purple-700 border-purple-200" }, // Purple
  { borda: "#d97706", fundoBadge: "bg-amber-50 text-amber-700 border-amber-200" }, // Amber
  { borda: "#e11d48", fundoBadge: "bg-rose-50 text-rose-700 border-rose-200" }, // Rose
  { borda: "#0891b2", fundoBadge: "bg-cyan-50 text-cyan-700 border-cyan-200" }, // Cyan
  { borda: "#4f46e5", fundoBadge: "bg-indigo-50 text-indigo-700 border-indigo-200" }, // Indigo
  { borda: "#475569", fundoBadge: "bg-slate-100 text-slate-700 border-slate-200" }, // Slate
] as const;

export function obterCorExperiencia(indice: number) {
  return PALETA_CORES_EXPERIENCIAS[indice % PALETA_CORES_EXPERIENCIAS.length];
}

