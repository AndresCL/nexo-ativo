"use client";

import { createContext } from "react";

// Prévias sem tela de carregamento podem apresentar a equipe imediatamente.
export const ContextoApresentacaoEquipe = createContext(true);
