import { screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { Board } from "@kanbix/shared-types";
import { renderWithProviders } from "./test-utils";
import { ApiError } from "@/lib/api-client";
import { boardService } from "@/services/board.service";
import { EditBoardDialog } from "@/app/(protected)/boards/[id]/edit-board-dialog";

jest.mock("@/services/board.service", () => ({
  boardService: { update: jest.fn() },
}));

const mockedUpdate = boardService.update as jest.Mock;

const board: Board = {
  id: "b1",
  name: "Sprint 1",
  description: "Board original",
  color: "#3B82F6",
  workspaceId: "w1",
  createdById: "u1",
  createdAt: "2026-01-01T00:00:00.000Z",
};

function setup() {
  return renderWithProviders(<EditBoardDialog board={board} />);
}

async function open() {
  await userEvent.click(screen.getByRole("button", { name: /editar quadro/i }));
  return screen.findByRole("dialog");
}

describe("EditBoardDialog", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("abre já preenchido com os dados atuais do board", async () => {
    setup();
    const dialog = await open();

    expect(within(dialog).getByLabelText(/nome/i)).toHaveValue("Sprint 1");
    expect(within(dialog).getByLabelText(/descrição/i)).toHaveValue(
      "Board original"
    );
    expect(within(dialog).getByRole("radio", { name: "Azul" })).toHaveAttribute(
      "aria-checked",
      "true"
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

  it("envia o nome e a cor alterados", async () => {
    mockedUpdate.mockResolvedValue({ ...board, name: "Sprint 2", color: "#10B981" });
    setup();
    const dialog = await open();

    await userEvent.clear(within(dialog).getByLabelText(/nome/i));
    await userEvent.type(within(dialog).getByLabelText(/nome/i), "Sprint 2");
    await userEvent.click(within(dialog).getByRole("radio", { name: "Verde" }));
    await userEvent.click(
      within(dialog).getByRole("button", { name: /salvar alterações/i })
    );

    await waitFor(() =>
      expect(mockedUpdate).toHaveBeenCalledWith("b1", {
        name: "Sprint 2",
        description: "Board original",
        color: "#10B981",
      })
    );
  });

  it("fecha o dialog no sucesso", async () => {
    mockedUpdate.mockResolvedValue(board);
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
    mockedUpdate.mockRejectedValue(new ApiError("Cor não permitida.", 400));
    setup();
    const dialog = await open();

    await userEvent.click(
      within(dialog).getByRole("button", { name: /salvar alterações/i })
    );

    expect(
      await within(dialog).findByText(/cor não permitida/i)
    ).toBeInTheDocument();
    expect(screen.getByRole("dialog")).toBeInTheDocument();
  });
});
