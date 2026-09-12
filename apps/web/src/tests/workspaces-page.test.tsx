import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { WorkspaceWithRole } from "@kanbix/shared-types";
import { renderWithProviders } from "./test-utils";
import WorkspacesPage from "@/app/(protected)/workspaces/page";

jest.mock("next/navigation", () => ({
  useRouter: () => ({ replace: jest.fn(), push: jest.fn() }),
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
    logout: jest.fn(),
  }),
}));

const mockUseWorkspaces = jest.fn();
jest.mock("@/hooks/use-workspaces", () => ({
  useWorkspaces: () => mockUseWorkspaces(),
}));

const mockMutate = jest.fn();
jest.mock("@/hooks/use-delete-workspace", () => ({
  useDeleteWorkspace: () => ({ mutate: mockMutate, isPending: false }),
}));

const workspace = (over: Partial<WorkspaceWithRole>): WorkspaceWithRole => ({
  id: "w1",
  name: "Time de Produto",
  description: null,
  createdAt: "2026-01-01T00:00:00.000Z",
  role: "MEMBER",
  ...over,
});

describe("WorkspacesPage", () => {
  it("mostra o skeleton enquanto carrega", () => {
    mockUseWorkspaces.mockReturnValue({ isPending: true, isError: false });

    renderWithProviders(<WorkspacesPage />);

    expect(
      screen.getByRole("status", { name: /carregando workspaces/i })
    ).toBeInTheDocument();
  });

  it("mostra erro com botão de retry que chama refetch", async () => {
    const refetch = jest.fn();
    mockUseWorkspaces.mockReturnValue({
      isPending: false,
      isError: true,
      isFetching: false,
      refetch,
    });

    renderWithProviders(<WorkspacesPage />);

    expect(
      screen.getByText(/não foi possível carregar seus workspaces/i)
    ).toBeInTheDocument();

    await userEvent.click(
      screen.getByRole("button", { name: /tentar de novo/i })
    );
    expect(refetch).toHaveBeenCalledTimes(1);
  });

  it("mostra o estado vazio quando não há workspaces", () => {
    mockUseWorkspaces.mockReturnValue({
      isPending: false,
      isError: false,
      data: [],
    });

    renderWithProviders(<WorkspacesPage />);

    expect(
      screen.getByText(/você ainda não participa de nenhum workspace/i)
    ).toBeInTheDocument();
  });

  it("lista os workspaces com o papel do usuário", () => {
    mockUseWorkspaces.mockReturnValue({
      isPending: false,
      isError: false,
      data: [
        workspace({ id: "w1", name: "Time de Produto", role: "OWNER" }),
        workspace({ id: "w2", name: "Marketing", role: "MEMBER" }),
      ],
    });

    renderWithProviders(<WorkspacesPage />);

    expect(screen.getByText("Time de Produto")).toBeInTheDocument();
    expect(screen.getByText("Marketing")).toBeInTheDocument();
    expect(screen.getByText("Dono")).toBeInTheDocument();
    expect(screen.getByText("Membro")).toBeInTheDocument();
  });

  it("só mostra o botão de excluir para workspaces onde o usuário é OWNER", () => {
    mockUseWorkspaces.mockReturnValue({
      isPending: false,
      isError: false,
      data: [
        workspace({ id: "w1", name: "Time de Produto", role: "OWNER" }),
        workspace({ id: "w2", name: "Marketing", role: "MEMBER" }),
      ],
    });

    renderWithProviders(<WorkspacesPage />);

    expect(
      screen.getByRole("button", { name: /excluir workspace time de produto/i })
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: /excluir workspace marketing/i })
    ).not.toBeInTheDocument();
  });

  it("exclui o workspace após confirmar", async () => {
    mockUseWorkspaces.mockReturnValue({
      isPending: false,
      isError: false,
      data: [workspace({ id: "w1", name: "Time de Produto", role: "OWNER" })],
    });

    renderWithProviders(<WorkspacesPage />);

    await userEvent.click(
      screen.getByRole("button", { name: /excluir workspace time de produto/i })
    );
    await userEvent.click(
      await screen.findByRole("button", { name: /^excluir$/i })
    );

    expect(mockMutate).toHaveBeenCalledWith("w1");
  });
});
