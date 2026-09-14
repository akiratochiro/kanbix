import type { Card, List } from "@kanbix/shared-types";
import {
  resolveCardDrop,
  resolveListDrop,
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

const fakeList = (id: string): List => ({
  id,
  name: id,
  position: 0,
  boardId: "board-1",
  createdAt: "2026-01-01T00:00:00.000Z",
});

describe("resolveListDrop", () => {
  const lists = [fakeList("A"), fakeList("B"), fakeList("C")];

  it("retorna o índice quando solta sobre a coluna arrastável (list-column) de outra lista", () => {
    expect(
      resolveListDrop(lists, "A", { type: "list-column", list: fakeList("C") })
    ).toBe(2);
  });

  it("retorna o índice quando solta sobre a área de soltar cartões (list) de outra lista", () => {
    expect(resolveListDrop(lists, "A", { type: "list", listId: "C" })).toBe(2);
  });

  it("retorna o índice quando solta sobre um cartão de outra lista", () => {
    expect(
      resolveListDrop(lists, "A", {
        type: "card",
        card: { id: "x" } as Card,
        listId: "B",
        index: 0,
      })
    ).toBe(1);
  });

  it("retorna null quando solta sobre ela mesma", () => {
    expect(
      resolveListDrop(lists, "A", { type: "list", listId: "A" })
    ).toBeNull();
  });

  it("retorna null quando não há alvo", () => {
    expect(resolveListDrop(lists, "A", undefined)).toBeNull();
  });

  it("retorna null quando o alvo não existe na lista", () => {
    expect(resolveListDrop(lists, "A", { type: "list", listId: "z" })).toBeNull();
  });
});
