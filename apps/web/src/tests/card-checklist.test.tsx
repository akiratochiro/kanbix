import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { Card, ChecklistItem } from "@kanbix/shared-types";
import { renderWithProviders } from "./test-utils";
import { CardChecklist } from "@/app/(protected)/boards/[id]/card-checklist";

const mockUseChecklistItems = jest.fn();
jest.mock("@/hooks/use-checklist-items", () => ({
  useChecklistItems: () => mockUseChecklistItems(),
}));

const mockCreateMutateAsync = jest.fn();
jest.mock("@/hooks/use-create-checklist-item", () => ({
  useCreateChecklistItem: () => ({ mutateAsync: mockCreateMutateAsync }),
}));

const mockUpdateMutate = jest.fn();
jest.mock("@/hooks/use-update-checklist-item", () => ({
  useUpdateChecklistItem: () => ({ mutate: mockUpdateMutate }),
}));

const mockDeleteMutate = jest.fn();
jest.mock("@/hooks/use-delete-checklist-item", () => ({
  useDeleteChecklistItem: () => ({ mutate: mockDeleteMutate }),
}));

function card(over: Partial<Card> = {}): Card {
  return {
    id: "c1",
    title: "Revisar PR",
    description: null,
    position: 0,
    priority: "LOW",
    dueDate: null,
    completedAt: null,
    listId: "l1",
    assigneeId: null,
    createdAt: "2026-01-01T00:00:00.000Z",
    labels: [],
    checklist: { total: 0, completed: 0 },
    ...over,
  };
}

const item = (over: Partial<ChecklistItem> = {}): ChecklistItem => ({
  id: "i1",
  text: "Escrever testes",
  completed: false,
  position: 0,
  cardId: "c1",
  createdAt: "2026-01-01T00:00:00.000Z",
  ...over,
});

describe("CardChecklist", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("mostra o progresso 'concluidos/total' quando há itens", () => {
    mockUseChecklistItems.mockReturnValue({
      data: [item({ id: "i1", completed: true }), item({ id: "i2", completed: false })],
      isPending: false,
      isError: false,
    });

    renderWithProviders(
      <CardChecklist card={card({ checklist: { total: 2, completed: 1 } })} />
    );

    expect(screen.getByText("1/2")).toBeInTheDocument();
  });

  it("marca um item como concluído ao clicar no checkbox", async () => {
    mockUseChecklistItems.mockReturnValue({
      data: [item({ id: "i1", completed: false })],
      isPending: false,
      isError: false,
    });

    renderWithProviders(
      <CardChecklist card={card({ checklist: { total: 1, completed: 0 } })} />
    );

    await userEvent.click(screen.getByRole("checkbox", { name: "Escrever testes" }));

    expect(mockUpdateMutate).toHaveBeenCalledWith({ itemId: "i1", completed: true });
  });

  it("exclui um item ao clicar no botão de excluir", async () => {
    mockUseChecklistItems.mockReturnValue({
      data: [item({ id: "i1" })],
      isPending: false,
      isError: false,
    });

    renderWithProviders(
      <CardChecklist card={card({ checklist: { total: 1, completed: 0 } })} />
    );

    await userEvent.click(
      screen.getByRole("button", { name: /excluir item escrever testes/i })
    );

    expect(mockDeleteMutate).toHaveBeenCalledWith("i1");
  });

  it("adiciona um novo item pelo QuickAddForm", async () => {
    mockUseChecklistItems.mockReturnValue({ data: [], isPending: false, isError: false });
    mockCreateMutateAsync.mockResolvedValue({});

    renderWithProviders(<CardChecklist card={card()} />);

    await userEvent.click(screen.getByRole("button", { name: /adicionar item/i }));
    await userEvent.type(
      screen.getByPlaceholderText(/descrição do item/i),
      "Atualizar docs"
    );
    await userEvent.click(screen.getByRole("button", { name: /^adicionar$/i }));

    expect(mockCreateMutateAsync).toHaveBeenCalledWith("Atualizar docs");
  });
});
