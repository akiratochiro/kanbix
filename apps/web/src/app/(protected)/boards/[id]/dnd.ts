import type { DraggableAttributes, DraggableSyntheticListeners } from "@dnd-kit/core";
import type { Card, List } from "@kanbix/shared-types";

/** Anexado a cada cartão arrastável (useSortable data). */
export interface CardDragData {
  type: "card";
  card: Card;
  listId: string;
  index: number;
}

/** Anexado à área de soltar cartões dentro de uma coluna (useDroppable data). */
export interface ListDropData {
  type: "list";
  listId: string;
}

/** Anexado à própria coluna, arrastável pelo grip handle (useSortable data). */
export interface ListDragData {
  type: "list-column";
  list: List;
}

/** Props do useSortable repassadas pra `SortableListColumn` até o ícone de grip. */
export interface ListDragHandleProps {
  attributes: DraggableAttributes;
  listeners: DraggableSyntheticListeners;
  setActivatorNodeRef: (element: HTMLElement | null) => void;
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

/**
 * Traduz "list X arrastada até estar sobre Y" no novo índice de X.
 *
 * O alvo (`over`) nunca é lido pelo id bruto do dnd-kit: a área de soltar
 * cartões de uma coluna (`dropzone:<id>`) ocupa quase o mesmo retângulo que
 * a própria coluna arrastável (`<id>`), então o `closestCorners` pode
 * escolher qualquer um dos dois — só a `data` de cada um diz a qual lista
 * ele pertence, por isso os três tipos possíveis de `over` são aceitos aqui.
 * Retorna null quando não há alvo válido ou o índice não mudou.
 */
export function resolveListDrop(
  lists: List[],
  activeId: string,
  over: CardDragData | ListDropData | ListDragData | undefined
): number | null {
  if (!over) return null;

  const overListId = over.type === "list-column" ? over.list.id : over.listId;
  if (overListId === activeId) return null;

  const newIndex = lists.findIndex((list) => list.id === overListId);
  if (newIndex === -1) return null;

  return newIndex;
}
