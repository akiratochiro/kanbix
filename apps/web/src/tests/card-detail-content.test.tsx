import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { Card } from "@kanbix/shared-types";
import { renderWithProviders } from "./test-utils";
import { ApiError } from "@/lib/api-client";
import { cardService } from "@/services/card.service";
import { CardDetailContent } from "@/app/(protected)/boards/[id]/card-detail-content";

jest.mock("@/services/card.service", () => ({
  cardService: { getById: jest.fn(), update: jest.fn(), remove: jest.fn() },
}));

const mockPush = jest.fn();
jest.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush }),
}));

jest.mock("@/hooks/use-board", () => ({
  useBoard: () => ({ data: { workspaceId: "w1" }, isPending: false }),
}));

const mockUseMembers = jest.fn();
jest.mock("@/hooks/use-members", () => ({
  useMembers: () => mockUseMembers(),
}));

const mockUseLabels = jest.fn();
jest.mock("@/hooks/use-labels", () => ({
  useLabels: () => mockUseLabels(),
}));
jest.mock("@/hooks/use-create-label", () => ({
  useCreateLabel: () => ({ mutate: jest.fn(), isPending: false }),
}));
jest.mock("@/hooks/use-add-card-label", () => ({
  useAddCardLabel: () => ({ mutate: jest.fn() }),
}));
jest.mock("@/hooks/use-remove-card-label", () => ({
  useRemoveCardLabel: () => ({ mutate: jest.fn() }),
}));

const mockUseChecklistItems = jest.fn();
jest.mock("@/hooks/use-checklist-items", () => ({
  useChecklistItems: () => mockUseChecklistItems(),
}));
jest.mock("@/hooks/use-create-checklist-item", () => ({
  useCreateChecklistItem: () => ({ mutateAsync: jest.fn().mockResolvedValue({}) }),
}));
jest.mock("@/hooks/use-update-checklist-item", () => ({
  useUpdateChecklistItem: () => ({ mutate: jest.fn() }),
}));
jest.mock("@/hooks/use-delete-checklist-item", () => ({
  useDeleteChecklistItem: () => ({ mutate: jest.fn() }),
}));

const mockedGetById = cardService.getById as jest.Mock;
const mockedUpdate = cardService.update as jest.Mock;
const mockedRemove = cardService.remove as jest.Mock;

const card: Card = {
  id: "c1",
  title: "Revisar PR",
  description: "Olhar os testes.",
  position: 0,
  priority: "MEDIUM",
  dueDate: "2026-03-10T00:00:00.000Z",
  completedAt: null,
  listId: "l1",
  assigneeId: null,
  createdAt: "2026-01-01T00:00:00.000Z",
  labels: [],
  checklist: { total: 0, completed: 0 },
};

function setup(cardId = "c1", boardId = "b1") {
  return renderWithProviders(
    <CardDetailContent cardId={cardId} boardId={boardId} />
  );
}

describe("CardDetailContent", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseMembers.mockReturnValue({ data: [], isPending: false });
    mockUseLabels.mockReturnValue({ data: [], isPending: false, isSuccess: true });
    mockUseChecklistItems.mockReturnValue({ data: [], isPending: false, isError: false });
  });

  it("mostra o skeleton enquanto carrega", () => {
    mockedGetById.mockReturnValue(new Promise(() => {}));

    setup();

    expect(
      screen.getByRole("status", { name: /carregando cartão/i })
    ).toBeInTheDocument();
  });

  it("mostra 'não encontrado' quando o card não existe", async () => {
    mockedGetById.mockRejectedValue(new ApiError("Card não encontrado.", 404));

    setup();

    expect(
      await screen.findByText(/cartão não encontrado/i)
    ).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: /voltar ao quadro/i })
    ).toHaveAttribute("href", "/boards/b1");
  });

  it("preenche o formulário com os dados do card", async () => {
    mockedGetById.mockResolvedValue(card);

    setup();

    expect(await screen.findByLabelText(/título/i)).toHaveValue("Revisar PR");
    expect(screen.getByLabelText(/descrição/i)).toHaveValue(
      "Olhar os testes."
    );
    expect(screen.getByLabelText(/data-limite/i)).toHaveValue("2026-03-10");
    const [priorityCombobox, assigneeCombobox] = screen.getAllByRole("combobox");
    expect(priorityCombobox).toHaveTextContent("Média");
    expect(assigneeCombobox).toHaveTextContent("Sem responsável");
  });

  it("salva as alterações com o payload correto", async () => {
    mockedGetById.mockResolvedValue(card);
    mockedUpdate.mockResolvedValue({ ...card, title: "Revisar PR (v2)" });

    setup();

    const titleInput = await screen.findByLabelText(/título/i);
    await userEvent.clear(titleInput);
    await userEvent.type(titleInput, "Revisar PR (v2)");
    await userEvent.click(screen.getByRole("button", { name: /^salvar$/i }));

    await waitFor(() =>
      expect(mockedUpdate).toHaveBeenCalledWith("c1", {
        title: "Revisar PR (v2)",
        description: "Olhar os testes.",
        priority: "MEDIUM",
        dueDate: "2026-03-10T00:00:00.000Z",
        assigneeId: null,
      })
    );
  });

  it("mostra o responsável já atribuído no select", async () => {
    mockUseMembers.mockReturnValue({
      data: [
        {
          userId: "u2",
          name: "Ada Lovelace",
          email: "ada@example.com",
          avatarUrl: null,
          role: "MEMBER",
          joinedAt: "2026-01-01T00:00:00.000Z",
        },
      ],
      isPending: false,
    });
    mockedGetById.mockResolvedValue({ ...card, assigneeId: "u2" });

    setup();

    await screen.findByLabelText(/título/i);
    const [, assigneeCombobox] = screen.getAllByRole("combobox");
    expect(assigneeCombobox).toHaveTextContent("Ada Lovelace");
  });

  // Abrir o dropdown de fato (clicar no trigger e escolher um item) trava
  // no jsdom — limitação conhecida do Radix Select com user-event, mesma
  // razão pela qual o drag-and-drop também não é testado aqui (território
  // de e2e). O payload de envio já é coberto acima com o valor padrão.

  it("marca o card como concluído e permite reabrir", async () => {
    mockedGetById.mockResolvedValue(card);
    const completedAt = "2026-03-11T10:00:00.000Z";
    mockedUpdate.mockResolvedValueOnce({ ...card, completedAt });

    setup();

    await screen.findByLabelText(/título/i);
    await userEvent.click(
      screen.getByRole("button", { name: /marcar como concluído/i })
    );

    await waitFor(() =>
      expect(mockedUpdate).toHaveBeenCalledWith(
        "c1",
        expect.objectContaining({ completedAt: expect.any(String) })
      )
    );
    expect(await screen.findByRole("button", { name: /^concluído$/i })).toBeInTheDocument();

    mockedUpdate.mockResolvedValueOnce({ ...card, completedAt: null });
    await userEvent.click(screen.getByRole("button", { name: /^concluído$/i }));

    await waitFor(() =>
      expect(mockedUpdate).toHaveBeenLastCalledWith(
        "c1",
        expect.objectContaining({ completedAt: null })
      )
    );
  });

  it("mostra a mensagem do servidor quando falha ao salvar", async () => {
    mockedGetById.mockResolvedValue(card);
    mockedUpdate.mockRejectedValue(new ApiError("Título inválido.", 400));

    setup();

    await screen.findByLabelText(/título/i);
    await userEvent.click(screen.getByRole("button", { name: /^salvar$/i }));

    expect(await screen.findByText(/título inválido/i)).toBeInTheDocument();
  });

  it("exclui o card e redireciona para o quadro", async () => {
    mockedGetById.mockResolvedValue(card);
    mockedRemove.mockResolvedValue(undefined);

    setup();

    await screen.findByLabelText(/título/i);
    await userEvent.click(
      screen.getByRole("button", { name: /excluir cartão/i })
    );
    await userEvent.click(
      await screen.findByRole("button", { name: /^excluir$/i })
    );

    await waitFor(() => expect(mockedRemove).toHaveBeenCalledWith("c1"));
    expect(mockPush).toHaveBeenCalledWith("/boards/b1");
  });
});
