import { screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { WorkspaceWithRole } from "@kanbix/shared-types";
import { renderWithProviders } from "./test-utils";
import { ApiError } from "@/lib/api-client";
import { workspaceService } from "@/services/workspace.service";
import { EditWorkspaceDialog } from "@/app/(protected)/workspaces/[id]/edit-workspace-dialog";

jest.mock("@/services/workspace.service", () => ({
  workspaceService: { update: jest.fn() },
}));

const mockedUpdate = workspaceService.update as jest.Mock;

const workspace: WorkspaceWithRole = {
  id: "w1",
  name: "Equipe Alfa",
  description: "Workspace original",
  createdAt: "2026-01-01T00:00:00.000Z",
  role: "OWNER",
};

function setup() {
  return renderWithProviders(<EditWorkspaceDialog workspace={workspace} />);
}

async function open() {
  await userEvent.click(
    screen.getByRole("button", { name: /editar workspace/i })
  );
  return screen.findByRole("dialog");
}

describe("EditWorkspaceDialog", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("abre já preenchido com os dados atuais do workspace", async () => {
    setup();
    const dialog = await open();

    expect(within(dialog).getByLabelText(/nome/i)).toHaveValue("Equipe Alfa");
    expect(within(dialog).getByLabelText(/descrição/i)).toHaveValue(
      "Workspace original"
    );
  });

  it("bloqueia o envio quando o nome é curto demais", async () => {
    setup();
    const dialog = await open();

    await userEvent.clear(within(dialog).getByLabelText(/nome/i));
    await userEvent.type(within(dialog).getByLabelText(/nome/i), "a");
    await userEvent.click(
      within(dialog).getByRole("button", { name: /salvar alterações/i })
    );

    expect(
      await within(dialog).findByText(/pelo menos 2 caracteres/i)
    ).toBeInTheDocument();
    expect(mockedUpdate).not.toHaveBeenCalled();
  });

  it("envia o nome alterado", async () => {
    mockedUpdate.mockResolvedValue({ ...workspace, name: "Equipe Beta" });
    setup();
    const dialog = await open();

    await userEvent.clear(within(dialog).getByLabelText(/nome/i));
    await userEvent.type(within(dialog).getByLabelText(/nome/i), "Equipe Beta");
    await userEvent.click(
      within(dialog).getByRole("button", { name: /salvar alterações/i })
    );

    await waitFor(() =>
      expect(mockedUpdate).toHaveBeenCalledWith("w1", {
        name: "Equipe Beta",
        description: "Workspace original",
      })
    );
  });

  it("fecha o dialog no sucesso", async () => {
    mockedUpdate.mockResolvedValue(workspace);
    setup();
    const dialog = await open();

    await userEvent.click(
      within(dialog).getByRole("button", { name: /salvar alterações/i })
    );

    await waitFor(() =>
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument()
    );
  });

  it("mostra a mensagem do servidor quando a API falha", async () => {
    mockedUpdate.mockRejectedValue(new ApiError("Nome já em uso.", 400));
    setup();
    const dialog = await open();

    await userEvent.click(
      within(dialog).getByRole("button", { name: /salvar alterações/i })
    );

    expect(
      await within(dialog).findByText(/nome já em uso/i)
    ).toBeInTheDocument();
    expect(screen.getByRole("dialog")).toBeInTheDocument();
  });
});
