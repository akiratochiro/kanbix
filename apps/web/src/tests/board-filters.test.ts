import type { Card, Label } from "@kanbix/shared-types";
import {
  EMPTY_FILTERS,
  UNASSIGNED_FILTER,
  hasActiveFilters,
  matchesFilters,
  type BoardFilters,
} from "@/app/(protected)/boards/[id]/board-filters";

const bugLabel: Label = {
  id: "lb1",
  name: "Bug",
  color: "#EF4444",
  boardId: "b1",
  createdAt: "2026-01-01T00:00:00.000Z",
};

function card(over: Partial<Card> = {}): Card {
  return {
    id: "c1",
    title: "Card",
    description: null,
    position: 0,
    priority: "MEDIUM",
    dueDate: null,
    completedAt: null,
    listId: "l1",
    assigneeId: null,
    createdAt: "2026-01-01T00:00:00.000Z",
    labels: [],
    checklist: { total: 0, completed: 0 },
    ...over,
  };
}

const now = new Date("2026-03-15T12:00:00.000Z");

describe("hasActiveFilters", () => {
  it("é false quando nenhum filtro está setado", () => {
    expect(hasActiveFilters(EMPTY_FILTERS)).toBe(false);
  });

  it("é true quando qualquer campo está preenchido", () => {
    expect(hasActiveFilters({ ...EMPTY_FILTERS, overdueOnly: true })).toBe(true);
    expect(
      hasActiveFilters({ ...EMPTY_FILTERS, priorities: new Set(["HIGH"]) })
    ).toBe(true);
    expect(hasActiveFilters({ ...EMPTY_FILTERS, assigneeId: "u1" })).toBe(true);
  });
});

describe("matchesFilters", () => {
  it("sem filtro ativo, todo card bate", () => {
    expect(matchesFilters(card(), EMPTY_FILTERS, now)).toBe(true);
  });

  it("filtra por prioridade", () => {
    const filters: BoardFilters = { ...EMPTY_FILTERS, priorities: new Set(["HIGH"]) };

    expect(matchesFilters(card({ priority: "HIGH" }), filters, now)).toBe(true);
    expect(matchesFilters(card({ priority: "LOW" }), filters, now)).toBe(false);
  });

  it("filtra por etiqueta (basta uma das selecionadas bater)", () => {
    const filters: BoardFilters = { ...EMPTY_FILTERS, labelIds: new Set(["lb1"]) };

    expect(matchesFilters(card({ labels: [bugLabel] }), filters, now)).toBe(true);
    expect(matchesFilters(card({ labels: [] }), filters, now)).toBe(false);
  });

  it("filtra por responsável específico", () => {
    const filters: BoardFilters = { ...EMPTY_FILTERS, assigneeId: "u1" };

    expect(matchesFilters(card({ assigneeId: "u1" }), filters, now)).toBe(true);
    expect(matchesFilters(card({ assigneeId: "u2" }), filters, now)).toBe(false);
    expect(matchesFilters(card({ assigneeId: null }), filters, now)).toBe(false);
  });

  it("filtra por 'sem responsável'", () => {
    const filters: BoardFilters = { ...EMPTY_FILTERS, assigneeId: UNASSIGNED_FILTER };

    expect(matchesFilters(card({ assigneeId: null }), filters, now)).toBe(true);
    expect(matchesFilters(card({ assigneeId: "u1" }), filters, now)).toBe(false);
  });

  describe("filtra por atrasado", () => {
    const filters: BoardFilters = { ...EMPTY_FILTERS, overdueOnly: true };

    it("bate quando dueDate já passou e não está concluído", () => {
      expect(
        matchesFilters(
          card({ dueDate: "2026-03-01T00:00:00.000Z", completedAt: null }),
          filters,
          now
        )
      ).toBe(true);
    });

    it("não bate quando já foi concluído, mesmo atrasado", () => {
      expect(
        matchesFilters(
          card({
            dueDate: "2026-03-01T00:00:00.000Z",
            completedAt: "2026-03-05T00:00:00.000Z",
          }),
          filters,
          now
        )
      ).toBe(false);
    });

    it("não bate quando a data-limite ainda não chegou", () => {
      expect(
        matchesFilters(card({ dueDate: "2026-04-01T00:00:00.000Z" }), filters, now)
      ).toBe(false);
    });

    it("não bate quando não tem data-limite", () => {
      expect(matchesFilters(card({ dueDate: null }), filters, now)).toBe(false);
    });
  });

  it("combina filtros com AND", () => {
    const filters: BoardFilters = {
      ...EMPTY_FILTERS,
      priorities: new Set(["URGENT"]),
      assigneeId: "u1",
    };

    expect(
      matchesFilters(card({ priority: "URGENT", assigneeId: "u1" }), filters, now)
    ).toBe(true);
    expect(
      matchesFilters(card({ priority: "URGENT", assigneeId: "u2" }), filters, now)
    ).toBe(false);
  });
});
