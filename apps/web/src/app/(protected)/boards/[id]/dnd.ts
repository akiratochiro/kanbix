import type { Card } from "@kanbix/shared-types";

/** Anexado a cada cartão arrastável (useSortable data). */
export interface CardDragData {
  type: "card";
  card: Card;
  listId: string;
  index: number;
}

/** Anexado a cada coluna como área de soltar (useDroppable data). */
export interface ListDropData {
  type: "list";
  listId: string;
}

export interface ResolvedMove {
  toListId: string;
  toIndex: number;
}

/**
 * Traduz "cartão X solto sobre Y" em (lista destino, índice destino).
 * - solto sobre outro cartão → assume a posição dele
 * - solto sobre a coluna (área vazia) → vai para o fim
 * Retorna null quando não há movimento (mesma posição) ou o alvo é inválido.
 */
export function resolveCardDrop(
  active: CardDragData,
  over: CardDragData | ListDropData | undefined,
  countInList: (listId: string) => number
): ResolvedMove | null {
  if (!over) return null;

  let toListId: string;
  let toIndex: number;

  if (over.type === "card") {
    toListId = over.listId;
    toIndex = over.index;
  } else {
    toListId = over.listId;
    toIndex = countInList(toListId);
  }

  if (toListId === active.listId && toIndex === active.index) return null;

  return { toListId, toIndex };
}
