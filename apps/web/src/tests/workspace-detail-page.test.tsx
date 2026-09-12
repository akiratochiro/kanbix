import { screen } from "@testing-library/react";
import { renderWithProviders } from "./test-utils";
import userEvent from "@testing-library/user-event";
import type { Board, WorkspaceWithRole } from "@kanbix/shared-types";
import { ApiError } from "@/lib/api-client";
import WorkspaceDetailPage from "@/app/(protected)/workspaces/[id]/page";

jest.mock("next/navigation", () => ({
  useParams: () => ({ id: "w1" }),
}));

const mockUseWorkspaces = jest.fn();
const mockUseBoards = jest.fn();
jest.mock("@/hooks/use-workspaces", () => ({
  useWorkspaces: () => mockUseWorkspaces(),
}));
jest.mock("@/hooks/use-boards", () => ({
  useBoards: () => mockUseBoards(),
}));

const mockUseDeleteBoard = jest.fn();
jest.mock("@/hooks/use-delete-board", () => ({
  useDeleteBoard: () => mockUseDeleteBoard(),
}));

jest.mock("@/lib/auth-context", () => ({
  useAuth: () => ({
    user: {
      id: "u1",
      name: "Ada Lovelace",
      email: "ada@example.com",
      avatarUrl: null,
      createdAt: "2026-01-01T00:00:00.000Z",
    },
  }),
}));

// A seção de membros tem sua própria suíte de testes (members-section.test.tsx).
jest.mock("@/app/(protected)/workspaces/[id]/members-section", () => ({
  MembersSection: () => null,
}));

const workspace = (over: Partial<WorkspaceWithRole> = {}): WorkspaceWithRole => ({
  id: "w1",
  name: "Time de Produto",
  description: "Discovery e roadmap",
  createdAt: "2026-01-01T00:00:00.000Z",
  role: "OWNER",
  ...over,
});

const board = (over: Partial<Board> = {}): Board => ({
  id: "b1",
  name: "Sprint 1",
  description: null,
  color: "#3B82F6",
  workspaceId: "w1",
  createdById: "u1",
  createdAt: "2026-01-01T00:00:00.000Z",
  ...over,
});

const workspacesLoaded = (data: WorkspaceWithRole[]) => ({
  data,
  isPending: false,
  isError: false,
  isSuccess: true,
});

const boardsLoaded = (data: Board[]) => ({
  data,
  isPending: false,
  isError: false,
  isFetching: false,
  refetch: jest.fn(),
});

describe("WorkspaceDetailPage", () => {
  beforeEach(() => {
    mockUseDeleteBoard.mockReturnValue({
      mutate: jest.fn(),
      isPending: false,
      error: null,
      reset: jest.fn(),
    });
  });

  it("não mostra a seção de quadros enquanto o workspace carrega", () => {
    mockUseWorkspaces.mockReturnValue({
      isPending: true,
      isError: false,
      isSuccess: false,
    });
    mockUseBoards.mockReturnValue({ isPending: true, isError: false });

    renderWithProviders(<WorkspaceDetailPage />);

    expect(
      screen.queryByRole("heading", { level: 2, name: /quadros/i })
    ).not.toBeInTheDocument();
  });

  it("mostra o nome do workspace e o skeleton dos quadros", () => {
    mockUseWorkspaces.mockReturnValue(workspacesLoaded([workspace()]));
    mockUseBoards.mockReturnValue({ isPending: true, isError: false });

    renderWithProviders(<WorkspaceDetailPage />);

    expect(
      screen.getByRole("heading", { name: "Time de Produto" })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("status", { name: /carregando quadros/i })
    ).toBeInTheDocument();
  });

  it("lista os quadros do workspace", () => {
    mockUseWorkspaces.mockReturnValue(workspacesLoaded([workspace()]));
    mockUseBoards.mockReturnValue(
      boardsLoaded([
        board({ id: "b1", name: "Sprint 1" }),
        board({ id: "b2", name: "Backlog" }),
      ])
    );

    renderWithProviders(<WorkspaceDetailPage />);

    expect(screen.getByText("Sprint 1")).toBeInTheDocument();
    expect(screen.getByText("Backlog")).toBeInTheDocument();
  });

  it("mostra o estado vazio quando não há quadros", () => {
    mockUseWorkspaces.mockReturnValue(workspacesLoaded([workspace()]));
    mockUseBoards.mockReturnValue(boardsLoaded([]));

    renderWithProviders(<WorkspaceDetailPage />);

    expect(
      screen.getByText(/este workspace ainda não tem quadros/i)
    ).toBeInTheDocument();
  });

  it("mostra erro dos quadros com retry que chama refetch", async () => {
    const refetch = jest.fn();
    mockUseWorkspaces.mockReturnValue(workspacesLoaded([workspace()]));
    mockUseBoards.mockReturnValue({
      isPending: false,
      isError: true,
      isFetching: false,
      refetch,
    });

    renderWithProviders(<WorkspaceDetailPage />);

    await userEvent.click(
      screen.getByRole("button", { name: /tentar de novo/i })
    );
    expect(refetch).toHaveBeenCalledTimes(1);
  });

  it("exclui um quadro após confirmar", async () => {
    const mutate = jest.fn();
    mockUseDeleteBoard.mockReturnValue({
      mutate,
      isPending: false,
      error: null,
      reset: jest.fn(),
    });
    mockUseWorkspaces.mockReturnValue(workspacesLoaded([workspace()]));
    mockUseBoards.mockReturnValue(boardsLoaded([board({ id: "b1", name: "Sprint 1" })]));

    renderWithProviders(<WorkspaceDetailPage />);

    await userEvent.click(
      screen.getByRole("button", { name: /excluir quadro sprint 1/i })
    );
    await userEvent.click(
      await screen.findByRole("button", { name: /^excluir$/i })
    );

    expect(mutate).toHaveBeenCalledWith("b1", expect.anything());
  });

  it("mostra a mensagem do servidor quando a exclusão do quadro falha", async () => {
    mockUseDeleteBoard.mockReturnValue({
      mutate: jest.fn(),
      isPending: false,
      error: new ApiError("Só o dono pode excluir este quadro.", 403),
      reset: jest.fn(),
    });
    mockUseWorkspaces.mockReturnValue(workspacesLoaded([workspace()]));
    mockUseBoards.mockReturnValue(boardsLoaded([board({ id: "b1", name: "Sprint 1" })]));

    renderWithProviders(<WorkspaceDetailPage />);

    await userEvent.click(
      screen.getByRole("button", { name: /excluir quadro sprint 1/i })
    );

    expect(
      await screen.findByText(/só o dono pode excluir este quadro/i)
    ).toBeInTheDocument();
  });

  it("mostra 'não encontrado' quando o workspace não está na lista", () => {
    mockUseWorkspaces.mockReturnValue(
      workspacesLoaded([workspace({ id: "outro" })])
    );
    mockUseBoards.mockReturnValue({ isPending: true, isError: false });

    renderWithProviders(<WorkspaceDetailPage />);

    expect(screen.getByText(/workspace não encontrado/i)).toBeInTheDocument();
    expect(
      screen.queryByRole("heading", { level: 2, name: /quadros/i })
    ).not.toBeInTheDocument();
  });
});
