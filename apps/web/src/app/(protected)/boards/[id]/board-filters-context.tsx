"use client";

import { createContext, useContext, useMemo, useState, type ReactNode } from "react";
import type { Card } from "@kanbix/shared-types";
import { EMPTY_FILTERS, matchesFilters, type BoardFilters } from "./board-filters";

interface BoardFiltersContextValue {
  filters: BoardFilters;
  setFilters: (filters: BoardFilters) => void;
  matches: (card: Card) => boolean;
}

// Valor padrão "sem filtro" (não um null+throw): ListColumn/CardBox
// funcionam normalmente mesmo fora de um BoardFiltersProvider — é uma
// melhoria opcional, não uma dependência obrigatória.
const defaultValue: BoardFiltersContextValue = {
  filters: EMPTY_FILTERS,
  setFilters: () => {},
  matches: () => true,
};

const BoardFiltersContext = createContext<BoardFiltersContextValue>(defaultValue);

export function BoardFiltersProvider({ children }: { children: ReactNode }) {
  const [filters, setFilters] = useState<BoardFilters>(EMPTY_FILTERS);

  const value = useMemo<BoardFiltersContextValue>(
    () => ({
      filters,
      setFilters,
      matches: (card) => matchesFilters(card, filters),
    }),
    [filters]
  );

  return (
    <BoardFiltersContext.Provider value={value}>
      {children}
    </BoardFiltersContext.Provider>
  );
}

export function useBoardFilters() {
  return useContext(BoardFiltersContext);
}
