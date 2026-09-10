import { screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { Workspace } from "@kanbix/shared-types";
import { renderWithProviders } from "./test-utils";
import { ApiError } from "@/lib/api-client";
import { workspaceService } from "@/services/workspace.service";
import { CreateWorkspaceDialog } from "@/app/(protected)/workspaces/create-workspace-dialog";

jest.mock("@/services/workspace.service", () => ({
  workspaceService: { list: jest.fn(), create: jest.fn() },
}));

const mockedCreate = workspaceService.create as jest.Mock;

const createdWorkspace: Workspace = {
  id: "w1",
  name: "Time de Produto",
  description: null,
  createdAt: "2026-01-01T00:00:00.000Z",
};

function setup() {
  return renderWithProviders(
    <CreateWorkspaceDialog trigger={<button>abrir</button>} />
  );
}

async function open() {
  await userEvent.click(screen.getByRole("button", { name: "abrir" }));
  return screen.findByRole("dialog");
}

describe("CreateWorkspaceDialog", () => {
  it("abre o dialog ao clicar no trigger", async () => {
    setup();
    const dialog = await open();

    expect(
      within(dialog).getByRole("heading", { name: /novo workspace/i })
    ).toBeInTheDocument();
  });

  it("bloqueia o envio quando o nome é curto demais", async () => {
    setup();
    const dialog = await open();

    await userEvent.type(within(dialog).getByLabelText(/nome/i), "a");
    await userEvent.click(
      within(dialog).getByRole("button", { name: /criar workspace/i })
    );

    expect(
      await within(dialog).findByText(/pelo menos 2 caracteres/i)
    ).toBeInTheDocument();
    expect(mockedCreate).not.toHaveBeenCalled();
  });

  it("envia nome e descrição para a API", async () => {
    mockedCreate.mockResolvedValue(createdWorkspace);
    setup();
    const dialog = await open();

    await userEvent.type(
      within(dialog).getByLabelText(/nome/i),
      "Time de Produto"
    );
    await userEvent.type(
      within(dialog).getByLabelText(/descrição/i),
      "Roadmap e discovery"
    );
    await userEvent.click(
      within(dialog).getByRole("button", { name: /criar workspace/i })
    );

    await waitFor(() =>
      expect(mockedCreate.mock.calls[0][0]).toEqual({
        name: "Time de Produto",
        description: "Roadmap e discovery",
      })
    );
  });

  it("fecha o dialog e invalida a lista em caso de sucesso", async () => {
    mockedCreate.mockResolvedValue(createdWorkspace);
    const { queryClient } = setup();
    const invalidateSpy = jest.spyOn(queryClient, "invalidateQueries");
    const dialog = await open();

    await userEvent.type(
      within(dialog).getByLabelText(/nome/i),
      "Time de Produto"
    );
    await userEvent.click(
      within(dialog).getByRole("button", { name: /criar workspace/i })
    );

    await waitFor(() =>
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument()
    );
    expect(invalidateSpy).toHaveBeenCalledWith({
      queryKey: ["workspaces", "list"],
    });
  });

  it("mostra a mensagem do servidor quando a API falha", async () => {
    mockedCreate.mockRejectedValue(new ApiError("Limite de workspaces atingido.", 400));
    setup();
    const dialog = await open();

    await userEvent.type(
      within(dialog).getByLabelText(/nome/i),
      "Time de Produto"
    );
    await userEvent.click(
      within(dialog).getByRole("button", { name: /criar workspace/i })
    );

    expect(
      await within(dialog).findByText(/limite de workspaces atingido/i)
    ).toBeInTheDocument();
    expect(screen.getByRole("dialog")).toBeInTheDocument();
  });
});
