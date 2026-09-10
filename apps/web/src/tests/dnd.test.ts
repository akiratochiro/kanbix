import type { Card } from "@kanbix/shared-types";
import {
  resolveCardDrop,
  type CardDragData,
  type ListDropData,
} from "@/app/(protected)/boards/[id]/dnd";

const fakeCard = { id: "x" } as Card;

const dragged = (listId: string, index: number): CardDragData => ({
  type: "card",
  card: fakeCard,
  listId,
  index,
});

const overCard = (listId: string, index: number): CardDragData => ({
  type: "card",
  card: fakeCard,
  listId,
  index,
});

const overList = (listId: string): ListDropData => ({ type: "list", listId });

const counts = (map: Record<string, number>) => (listId: string) =>
  map[listId] ?? 0;

describe("resolveCardDrop", () => {
  it("solto sobre outro cartão assume a posição dele", () => {
    expect(
      resolveCardDrop(dragged("A", 0), overCard("A", 2), counts({}))
    ).toEqual({ toListId: "A", toIndex: 2 });
  });

  it("solto sobre a coluna vai para o fim", () => {
    expect(
      resolveCardDrop(dragged("A", 0), overList("B"), counts({ B: 3 }))
    ).toEqual({ toListId: "B", toIndex: 3 });
  });

  it("retorna null quando cai na própria posição", () => {
    expect(
      resolveCardDrop(dragged("A", 1), overCard("A", 1), counts({}))
    ).toBeNull();
  });

  it("retorna null quando não há alvo", () => {
    expect(resolveCardDrop(dragged("A", 0), undefined, counts({}))).toBeNull();
  });

  it("move entre listas mantendo o índice do cartão alvo", () => {
    expect(
      resolveCardDrop(dragged("A", 0), overCard("B", 1), counts({}))
    ).toEqual({ toListId: "B", toIndex: 1 });
  });
});
