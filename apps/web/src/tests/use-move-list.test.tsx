import type { ReactNode } from "react";
import { renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { List } from "@kanbix/shared-types";
import { listKeys } from "@/lib/query-keys";
import { listService } from "@/services/list.service";
import { useMoveList } from "@/hooks/use-move-list";

jest.mock("@/services/list.service", () => ({
  listService: { move: jest.fn() },
}));

const mockedMove = listService.move as jest.Mock;

const list = (id: string, position: number): List => ({
  id,
  name: id,
  position,
  boardId: "board-1",
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

  const { result } = renderHook(() => useMoveList("board-1"), { wrapper });
  return { queryClient, result };
}

const idsOf = (qc: QueryClient) =>
  (qc.getQueryData<List[]>(listKeys.listByBoard("board-1")) ?? []).map(
    (l) => l.id
  );

describe("useMoveList", () => {
  it("reordena as listas do board no cache imediatamente", async () => {
    mockedMove.mockResolvedValue(list("l0", 2));
    const { queryClient, result } = setup((qc) => {
      qc.setQueryData(listKeys.listByBoard("board-1"), [
        list("l0", 0),
        list("l1", 1),
        list("l2", 2),
      ]);
    });

    result.current.mutate({ listId: "l0", toIndex: 2 });

    await waitFor(() => expect(idsOf(queryClient)).toEqual(["l1", "l2", "l0"]));
  });

  it("reverte o cache quando a API falha", async () => {
    mockedMove.mockRejectedValue(new Error("500"));
    const { queryClient, result } = setup((qc) => {
      qc.setQueryData(listKeys.listByBoard("board-1"), [
        list("l0", 0),
        list("l1", 1),
      ]);
    });

    result.current.mutate({ listId: "l0", toIndex: 1 });

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(idsOf(queryClient)).toEqual(["l0", "l1"]);
  });
});
