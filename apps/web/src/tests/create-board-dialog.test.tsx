import { screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { Board } from "@kanbix/shared-types";
import { renderWithProviders } from "./test-utils";
import { ApiError } from "@/lib/api-client";
import { boardService } from "@/services/board.service";
import { CreateBoardDialog } from "@/app/(protected)/workspaces/[id]/create-board-dialog";

jest.mock("@/services/board.service", () => ({
  boardService: { listByWorkspace: jest.fn(), create: jest.fn() },
}));

const mockedCreate = boardService.create as jest.Mock;

const createdBoard: Board = {
  id: "b1",
  name: "Sprint 1",
  description: null,
  color: "#3B82F6",
  workspaceId: "w1",
  createdById: "u1",
  createdAt: "2026-01-01T00:00:00.000Z",
};

function setup() {
  return renderWithProviders(
    <CreateBoardDialog workspaceId="w1" trigger={<button>abrir</button>} />
  );
}

async function open() {
  await userEvent.click(screen.getByRole("button", { name: "abrir" }));
  return screen.findByRole("dialog");
}

describe("CreateBoardDialog", () => {
  it("bloqueia o envio quando o nome é curto demais", async () => {
    setup();
    const dialog = await open();

    await userEvent.type(within(dialog).getByLabelText(/nome/i), "a");
    await userEvent.click(
      within(dialog).getByRole("button", { name: /criar quadro/i })
    );

    expect(
      await within(dialog).findByText(/pelo menos 2 caracteres/i)
    ).toBeInTheDocument();
    expect(mockedCreate).not.toHaveBeenCalled();
  });

  it("envia workspaceId, nome e a cor selecionada", async () => {
    mockedCreate.mockResolvedValue(createdBoard);
    setup();
    const dialog = await open();

    await userEvent.type(within(dialog).getByLabelText(/nome/i), "Sprint 1");
    await userEvent.click(within(dialog).getByRole("radio", { name: "Verde" }));
    await userEvent.click(
      within(dialog).getByRole("button", { name: /criar quadro/i })
    );

    await waitFor(() =>
      expect(mockedCreate).toHaveBeenCalledWith("w1", {
        name: "Sprint 1",
        description: undefined,
        color: "#10B981",
      })
    );
  });

  it("fecha o dialog e invalida a lista de boards no sucesso", async () => {
    mockedCreate.mockResolvedValue(createdBoard);
    const { queryClient } = setup();
    const invalidateSpy = jest.spyOn(queryClient, "invalidateQueries");
    const dialog = await open();

    await userEvent.type(within(dialog).getByLabelText(/nome/i), "Sprint 1");
    await userEvent.click(
      within(dialog).getByRole("button", { name: /criar quadro/i })
    );

    await waitFor(() =>
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument()
    );
    expect(invalidateSpy).toHaveBeenCalledWith({
      queryKey: ["boards", "workspace", "w1"],
    });
  });

  it("mostra a mensagem do servidor quando a API falha", async () => {
    mockedCreate.mockRejectedValue(new ApiError("Cor não permitida.", 400));
    setup();
    const dialog = await open();

    await userEvent.type(within(dialog).getByLabelText(/nome/i), "Sprint 1");
    await userEvent.click(
      within(dialog).getByRole("button", { name: /criar quadro/i })
    );

    expect(
      await within(dialog).findByText(/cor não permitida/i)
    ).toBeInTheDocument();
    expect(screen.getByRole("dialog")).toBeInTheDocument();
  });
});
