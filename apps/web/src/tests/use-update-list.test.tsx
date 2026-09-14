import type { ReactNode } from "react";
import { renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { List } from "@kanbix/shared-types";
import { listKeys } from "@/lib/query-keys";
import { listService } from "@/services/list.service";
import { useUpdateList } from "@/hooks/use-update-list";

jest.mock("@/services/list.service", () => ({
  listService: { update: jest.fn() },
}));

const mockedUpdate = listService.update as jest.Mock;

const list = (id: string, name: string): List => ({
  id,
  name,
  position: 0,
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

  const { result } = renderHook(() => useUpdateList("board-1"), { wrapper });
  return { queryClient, result };
}

const namesOf = (qc: QueryClient) =>
  (qc.getQueryData<List[]>(listKeys.listByBoard("board-1")) ?? []).map(
    (l) => l.name
  );

describe("useUpdateList", () => {
  it("atualiza o nome da lista no cache imediatamente", async () => {
    mockedUpdate.mockResolvedValue(list("l0", "Em Progresso"));
    const { queryClient, result } = setup((qc) => {
      qc.setQueryData(listKeys.listByBoard("board-1"), [
        list("l0", "A Fazer"),
        list("l1", "Feito"),
      ]);
    });

    result.current.mutate({ listId: "l0", name: "Em Progresso" });

    await waitFor(() =>
      expect(namesOf(queryClient)).toEqual(["Em Progresso", "Feito"])
    );
  });

  it("reverte o cache quando a API falha", async () => {
    mockedUpdate.mockRejectedValue(new Error("500"));
    const { queryClient, result } = setup((qc) => {
      qc.setQueryData(listKeys.listByBoard("board-1"), [list("l0", "A Fazer")]);
    });

    result.current.mutate({ listId: "l0", name: "Em Progresso" });

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(namesOf(queryClient)).toEqual(["A Fazer"]);
  });
});
