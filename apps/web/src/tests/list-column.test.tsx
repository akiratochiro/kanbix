import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { Card, List } from "@kanbix/shared-types";
import { ListColumn } from "@/app/(protected)/boards/[id]/list-column";

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

  it("renderiza os cartões com título, prioridade e data", () => {
    mockUseCards.mockReturnValue(
      cardsLoaded([
        card({ id: "c1", title: "Revisar PR", priority: "LOW" }),
        card({
          id: "c2",
          title: "Deploy urgente",
          priority: "URGENT",
          dueDate: "2026-03-10T00:00:00.000Z",
        }),
      ])
    );

    render(<ListColumn list={list} />);

    expect(screen.getByText("Revisar PR")).toBeInTheDocument();
    expect(screen.getByText("Deploy urgente")).toBeInTheDocument();
    expect(screen.getByText("Urgente")).toBeInTheDocument();
    expect(screen.getByText("10/03")).toBeInTheDocument();
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
});
