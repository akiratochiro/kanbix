import { screen } from "@testing-library/react";
import { renderWithProviders } from "./test-utils";
import userEvent from "@testing-library/user-event";
import type { Board, WorkspaceWithRole } from "@kanbix/shared-types";
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
