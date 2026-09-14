import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { Card, List } from "@kanbix/shared-types";
import { ListColumn } from "@/app/(protected)/boards/[id]/list-column";
import { EMPTY_FILTERS } from "@/app/(protected)/boards/[id]/board-filters";

const mockUseCards = jest.fn();
jest.mock("@/hooks/use-cards", () => ({ useCards: () => mockUseCards() }));
jest.mock("@/hooks/use-create-card", () => ({
  useCreateCard: () => ({ mutateAsync: jest.fn().mockResolvedValue({}) }),
}));
jest.mock("next/navigation", () => ({
  useParams: () => ({ id: "b1" }),
}));

const mockDeleteListMutate = jest.fn();
jest.mock("@/hooks/use-delete-list", () => ({
  useDeleteList: () => ({ mutate: mockDeleteListMutate, isPending: false }),
}));

jest.mock("@/hooks/use-update-list", () => ({
  useUpdateList: () => ({ mutate: jest.fn() }),
}));

const mockUseBoardFilters = jest.fn();
jest.mock("@/app/(protected)/boards/[id]/board-filters-context", () => ({
  useBoardFilters: () => mockUseBoardFilters(),
}));

const list: List = {
  id: "l1",
  name: "A fazer",
  position: 0,
  boardId: "b1",
  createdAt: "2026-01-01T00:00:00.000Z",
};

const card = (over: Partial<Card>): Card => ({
  id: "c1",
  title: "Revisar PR",
  description: null,
  position: 0,
  priority: "LOW",
  dueDate: null,
  completedAt: null,
  listId: "l1",
  assigneeId: null,
  createdAt: "2026-01-01T00:00:00.000Z",
  labels: [],
  checklist: { total: 0, completed: 0 },
  ...over,
});

const cardsLoaded = (data: Card[]) => ({
  data,
  isPending: false,
  isError: false,
  isSuccess: true,
  isFetching: false,
  refetch: jest.fn(),
});

describe("ListColumn", () => {
  beforeEach(() => {
    mockUseBoardFilters.mockReturnValue({
      filters: EMPTY_FILTERS,
      setFilters: jest.fn(),
      matches: () => true,
    });
  });

  it("mostra o skeleton dos cartões enquanto carrega", () => {
    mockUseCards.mockReturnValue({ isPending: true, isError: false });

    render(<ListColumn list={list} />);

    expect(
      screen.getByRole("status", { name: /carregando cartões de a fazer/i })
    ).toBeInTheDocument();
  });

  it("mostra 'sem cartões' quando a lista está vazia", () => {
    mockUseCards.mockReturnValue(cardsLoaded([]));

    render(<ListColumn list={list} />);

    expect(screen.getByText(/sem cartões/i)).toBeInTheDocument();
  });

  it("renderiza os cartões com título, prioridade, data, etiquetas e checklist", () => {
    mockUseCards.mockReturnValue(
      cardsLoaded([
        card({
          id: "c1",
          title: "Revisar PR",
          priority: "LOW",
          labels: [
            { id: "lb1", name: "Bug", color: "#EF4444", boardId: "b1", createdAt: "2026-01-01T00:00:00.000Z" },
          ],
        }),
        card({
          id: "c2",
          title: "Deploy urgente",
          priority: "URGENT",
          dueDate: "2026-03-10T00:00:00.000Z",
          checklist: { total: 3, completed: 1 },
        }),
      ])
    );

    render(<ListColumn list={list} />);

    expect(screen.getByText("Revisar PR")).toBeInTheDocument();
    expect(screen.getByText("Deploy urgente")).toBeInTheDocument();
    expect(screen.getByText("Urgente")).toBeInTheDocument();
    expect(screen.getByText("1/3")).toBeInTheDocument();
    expect(screen.getByText("10/03")).toBeInTheDocument();
    expect(screen.getByRole("img", { name: "Bug" })).toBeInTheDocument();
    // prioridade LOW não vira badge
    expect(screen.queryByText("Baixa")).not.toBeInTheDocument();
  });

  it("mostra erro com retry que chama refetch", async () => {
    const refetch = jest.fn();
    mockUseCards.mockReturnValue({
      isPending: false,
      isError: true,
      isFetching: false,
      refetch,
    });

    render(<ListColumn list={list} />);

    await userEvent.click(
      screen.getByRole("button", { name: /tentar de novo/i })
    );
    expect(refetch).toHaveBeenCalledTimes(1);
  });

  it("renderiza o handle de arrastar a lista", () => {
    mockUseCards.mockReturnValue(cardsLoaded([]));

    render(<ListColumn list={list} />);

    expect(
      screen.getByRole("button", { name: /arrastar lista a fazer/i })
    ).toBeInTheDocument();
  });

  it("exclui a lista após confirmar", async () => {
    mockUseCards.mockReturnValue(cardsLoaded([]));

    render(<ListColumn list={list} />);

    await userEvent.click(
      screen.getByRole("button", { name: /excluir lista a fazer/i })
    );
    await userEvent.click(
      await screen.findByRole("button", { name: /^excluir$/i })
    );

    expect(mockDeleteListMutate).toHaveBeenCalledWith("l1");
  });

  it("com filtro ativo, mostra 'correspondem/total' no cabeçalho", () => {
    mockUseCards.mockReturnValue(
      cardsLoaded([card({ id: "c1" }), card({ id: "c2" })])
    );
    mockUseBoardFilters.mockReturnValue({
      filters: { ...EMPTY_FILTERS, overdueOnly: true },
      setFilters: jest.fn(),
      matches: (c: Card) => c.id === "c1",
    });

    render(<ListColumn list={list} />);

    expect(screen.getByText("1/2")).toBeInTheDocument();
  });

  it("com filtro ativo, apaga (opacity) o cartão que não corresponde", () => {
    mockUseCards.mockReturnValue(
      cardsLoaded([
        card({ id: "c1", title: "Bate no filtro" }),
        card({ id: "c2", title: "Não bate" }),
      ])
    );
    mockUseBoardFilters.mockReturnValue({
      filters: { ...EMPTY_FILTERS, overdueOnly: true },
      setFilters: jest.fn(),
      matches: (c: Card) => c.id === "c1",
    });

    render(<ListColumn list={list} />);

    const matching = screen.getByText("Bate no filtro").closest("li");
    const nonMatching = screen.getByText("Não bate").closest("li");

    expect(matching).not.toHaveClass("opacity-40");
    expect(nonMatching).toHaveClass("opacity-40");
  });
});
