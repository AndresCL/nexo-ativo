import { z } from "zod";

// null permite limpar um limite já salvo mesmo em gravações com merge.
export const esquemaLimiteAvataresEquipe = z.number().int().positive().safe().nullable().optional();
