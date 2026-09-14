import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { Card } from "@kanbix/shared-types";
import { renderWithProviders } from "./test-utils";
import { cardService } from "@/services/card.service";
import { CardDetailContent } from "@/app/(protected)/boards/[id]/card-detail-content";
import { CardDetailModal } from "@/app/(protected)/boards/[id]/card-detail-modal";

jest.mock("@/services/card.service", () => ({
  cardService: { getById: jest.fn(), update: jest.fn(), remove: jest.fn() },
}));

const mockBack = jest.fn();
jest.mock("next/navigation", () => ({
  useRouter: () => ({ back: mockBack, push: jest.fn() }),
}));

jest.mock("@/hooks/use-board", () => ({
  useBoard: () => ({ data: { workspaceId: "w1" }, isPending: false }),
}));
jest.mock("@/hooks/use-members", () => ({
  useMembers: () => ({ data: [], isPending: false }),
}));
jest.mock("@/hooks/use-labels", () => ({
  useLabels: () => ({ data: [], isPending: false, isSuccess: true }),
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
jest.mock("@/hooks/use-checklist-items", () => ({
  useChecklistItems: () => ({ data: [], isPending: false, isError: false }),
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

const card: Card = {
  id: "c1",
  title: "Revisar PR",
  description: "Olhar os testes.",
  position: 0,
  priority: "MEDIUM",
  dueDate: null,
  completedAt: null,
  listId: "l1",
  assigneeId: null,
  createdAt: "2026-01-01T00:00:00.000Z",
  labels: [],
  checklist: { total: 0, completed: 0 },
};

function setup() {
  return renderWithProviders(
    <CardDetailModal>
      <CardDetailContent cardId="c1" boardId="b1" />
    </CardDetailModal>
  );
}

describe("CardDetailModal - alterações não salvas", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockedGetById.mockResolvedValue(card);
  });

  it("fecha direto quando não há alterações", async () => {
    setup();

    await screen.findByLabelText(/título/i);
    await userEvent.click(screen.getByRole("button", { name: /close/i }));

    expect(mockBack).toHaveBeenCalled();
    expect(
      screen.queryByText(/descartar alterações/i)
    ).not.toBeInTheDocument();
  });

  it("pede confirmação ao fechar com edição não salva, e 'continuar editando' mantém o valor", async () => {
    setup();

    const titleInput = await screen.findByLabelText(/título/i);
    await userEvent.type(titleInput, " (rascunho)");
    await userEvent.click(screen.getByRole("button", { name: /close/i }));

    expect(await screen.findByText(/descartar alterações/i)).toBeInTheDocument();
    expect(mockBack).not.toHaveBeenCalled();

    await userEvent.click(
      screen.getByRole("button", { name: /continuar editando/i })
    );

    expect(screen.queryByText(/descartar alterações/i)).not.toBeInTheDocument();
    expect(titleInput).toHaveValue("Revisar PR (rascunho)");
  });

  it("'descartar e sair' fecha o modal perdendo a edição", async () => {
    setup();

    const titleInput = await screen.findByLabelText(/título/i);
    await userEvent.type(titleInput, " (rascunho)");
    await userEvent.click(screen.getByRole("button", { name: /close/i }));

    await userEvent.click(
      await screen.findByRole("button", { name: /descartar e sair/i })
    );

    expect(mockBack).toHaveBeenCalled();
  });

  it("depois de salvar, fechar não pede mais confirmação", async () => {
    mockedUpdate.mockResolvedValue({ ...card, title: "Revisar PR (v2)" });
    setup();

    const titleInput = await screen.findByLabelText(/título/i);
    await userEvent.type(titleInput, " (v2)");
    await userEvent.click(screen.getByRole("button", { name: /^salvar$/i }));

    await waitFor(() => expect(mockedUpdate).toHaveBeenCalled());

    await userEvent.click(screen.getByRole("button", { name: /close/i }));

    expect(mockBack).toHaveBeenCalled();
    expect(
      screen.queryByText(/descartar alterações/i)
    ).not.toBeInTheDocument();
  });
});
