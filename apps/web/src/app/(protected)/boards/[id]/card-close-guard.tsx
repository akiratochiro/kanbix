"use client";

import { createContext, useContext } from "react";

/**
 * Ponte entre o form do card-detail (que sabe se há alterações não salvas)
 * e o Dialog do modal (que decide se pode fechar). Usa um setter de ref, não
 * useState, porque é só uma leitura no momento do fechamento — não precisa
 * re-renderizar nada quando o valor muda.
 */
type CardCloseGuard = {
  setDirty: (dirty: boolean) => void;
};

const CardCloseGuardContext = createContext<CardCloseGuard | null>(null);

export const CardCloseGuardProvider = CardCloseGuardContext.Provider;

export function useCardCloseGuard() {
  return useContext(CardCloseGuardContext);
}
