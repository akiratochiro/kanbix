import type { ReactNode } from "react";
import { renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { Card } from "@kanbix/shared-types";
import { cardKeys } from "@/lib/query-keys";
import { cardService } from "@/services/card.service";
import { useMoveCard } from "@/hooks/use-move-card";

jest.mock("@/services/card.service", () => ({
  cardService: { move: jest.fn() },
}));

const mockedMove = cardService.move as jest.Mock;

const card = (id: string, listId: string, position: number): Card => ({
  id,
  title: id,
  description: null,
  position,
  priority: "LOW",
  dueDate: null,
  listId,
  assigneeId: null,
  createdAt: "2026-01-01T00:00:00.000Z",
});

function setup(seed: (qc: QueryClient) => void) {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });
  seed(queryClient);

  const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );

  const { result } = renderHook(() => useMoveCard(), { wrapper });
  return { queryClient, result };
}

const idsOf = (qc: QueryClient, listId: string) =>
  (qc.getQueryData<Card[]>(cardKeys.listByList(listId)) ?? []).map((c) => c.id);

describe("useMoveCard", () => {
  it("move o cartão entre listas no cache imediatamente", async () => {
    mockedMove.mockResolvedValue(card("a0", "B", 1));
    const { queryClient, result } = setup((qc) => {
      qc.setQueryData(cardKeys.listByList("A"), [
        card("a0", "A", 0),
        card("a1", "A", 1),
      ]);
      qc.setQueryData(cardKeys.listByList("B"), [
        card("b0", "B", 0),
        card("b1", "B", 1),
      ]);
    });

    result.current.mutate({
      cardId: "a0",
      fromListId: "A",
      toListId: "B",
      toIndex: 1,
    });

    await waitFor(() => expect(idsOf(queryClient, "A")).toEqual(["a1"]));
    expect(idsOf(queryClient, "B")).toEqual(["b0", "a0", "b1"]);
  });

  it("reordena dentro da mesma lista", async () => {
    mockedMove.mockResolvedValue(card("a0", "A", 2));
    const { queryClient, result } = setup((qc) => {
      qc.setQueryData(cardKeys.listByList("A"), [
        card("a0", "A", 0),
        card("a1", "A", 1),
        card("a2", "A", 2),
      ]);
    });

    result.current.mutate({
      cardId: "a0",
      fromListId: "A",
      toListId: "A",
      toIndex: 2,
    });

    await waitFor(() =>
      expect(idsOf(queryClient, "A")).toEqual(["a1", "a2", "a0"])
    );
  });

  it("reverte o cache quando a API falha", async () => {
    mockedMove.mockRejectedValue(new Error("500"));
    const { queryClient, result } = setup((qc) => {
      qc.setQueryData(cardKeys.listByList("A"), [
        card("a0", "A", 0),
        card("a1", "A", 1),
      ]);
      qc.setQueryData(cardKeys.listByList("B"), [card("b0", "B", 0)]);
    });

    result.current.mutate({
      cardId: "a0",
      fromListId: "A",
      toListId: "B",
      toIndex: 0,
    });

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(idsOf(queryClient, "A")).toEqual(["a0", "a1"]);
    expect(idsOf(queryClient, "B")).toEqual(["b0"]);
  });
});
