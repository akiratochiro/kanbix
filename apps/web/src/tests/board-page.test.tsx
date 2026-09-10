import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { Board, List } from "@kanbix/shared-types";
import { renderWithProviders } from "./test-utils";
import BoardPage from "@/app/(protected)/boards/[id]/page";

jest.mock("next/navigation", () => ({
  useParams: () => ({ id: "b1" }),
}));

const mockUseBoard = jest.fn();
const mockUseLists = jest.fn();
jest.mock("@/hooks/use-board", () => ({ useBoard: () => mockUseBoard() }));
jest.mock("@/hooks/use-lists", () => ({ useLists: () => mockUseLists() }));

// A pagina delega os cartoes ao ListColumn; aqui so nos interessam as colunas.
jest.mock("@/hooks/use-cards", () => ({
  useCards: () => ({
    data: [],
    isPending: false,
    isError: false,
    isSuccess: true,
  }),
}));

const board: Board = {
  id: "b1",
  name: "Sprint 1",
  description: null,
  color: "#10B981",
  workspaceId: "w9",
  createdById: "u1",
  createdAt: "2026-01-01T00:00:00.000Z",
};

const list = (over: Partial<List>): List => ({
  id: "l1",
  name: "A fazer",
  position: 0,
  boardId: "b1",
  createdAt: "2026-01-01T00:00:00.000Z",
  ...over,
});

const boardLoaded = { data: board, isPending: false, isError: false, isSuccess: true };
const listsLoaded = (data: List[]) => ({
  data,
  isPending: false,
  isError: false,
  isFetching: false,
  refetch: jest.fn(),
});

describe("BoardPage", () => {
  it("não renderiza as listas enquanto o board carrega", () => {
    mockUseBoard.mockReturnValue({ isPending: true, isError: false, isSuccess: false });
    mockUseLists.mockReturnValue({ isPending: true, isError: false });

    renderWithProviders(<BoardPage />);

    expect(screen.queryByRole("status")).not.toBeInTheDocument();
  });

  it("mostra 'não encontrado' quando o board falha", () => {
    mockUseBoard.mockReturnValue({ isPending: false, isError: true, isSuccess: false });
    mockUseLists.mockReturnValue({ isPending: true, isError: false });

    renderWithProviders(<BoardPage />);

    expect(screen.getByText(/quadro não encontrado/i)).toBeInTheDocument();
  });

  it("mostra o nome do board e o skeleton das listas", () => {
    mockUseBoard.mockReturnValue(boardLoaded);
    mockUseLists.mockReturnValue({ isPending: true, isError: false });

    renderWithProviders(<BoardPage />);

    expect(
      screen.getByRole("heading", { name: "Sprint 1" })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("status", { name: /carregando listas/i })
    ).toBeInTheDocument();
  });

  it("lista as colunas e aponta o voltar para o workspace do board", () => {
    mockUseBoard.mockReturnValue(boardLoaded);
    mockUseLists.mockReturnValue(
      listsLoaded([
        list({ id: "l1", name: "A fazer" }),
        list({ id: "l2", name: "Feito" }),
      ])
    );

    renderWithProviders(<BoardPage />);

    expect(screen.getByRole("heading", { name: "A fazer" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Feito" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /voltar/i })).toHaveAttribute(
      "href",
      "/workspaces/w9"
    );
  });

  it("mostra o estado vazio quando não há listas", () => {
    mockUseBoard.mockReturnValue(boardLoaded);
    mockUseLists.mockReturnValue(listsLoaded([]));

    renderWithProviders(<BoardPage />);

    expect(
      screen.getByText(/este quadro ainda não tem listas/i)
    ).toBeInTheDocument();
  });

  it("mostra erro das listas com retry que chama refetch", async () => {
    const refetch = jest.fn();
    mockUseBoard.mockReturnValue(boardLoaded);
    mockUseLists.mockReturnValue({
      isPending: false,
      isError: true,
      isFetching: false,
      refetch,
    });

    renderWithProviders(<BoardPage />);

    await userEvent.click(
      screen.getByRole("button", { name: /tentar de novo/i })
    );
    expect(refetch).toHaveBeenCalledTimes(1);
  });
});
