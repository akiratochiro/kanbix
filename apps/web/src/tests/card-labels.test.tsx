import { screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { Card, Label } from "@kanbix/shared-types";
import { renderWithProviders } from "./test-utils";
import { CardLabels } from "@/app/(protected)/boards/[id]/card-labels";

const mockUseLabels = jest.fn();
jest.mock("@/hooks/use-labels", () => ({
  useLabels: () => mockUseLabels(),
}));

const mockCreateLabelMutate = jest.fn();
jest.mock("@/hooks/use-create-label", () => ({
  useCreateLabel: () => ({ mutate: mockCreateLabelMutate, isPending: false }),
}));

const mockAddLabelMutate = jest.fn();
jest.mock("@/hooks/use-add-card-label", () => ({
  useAddCardLabel: () => ({ mutate: mockAddLabelMutate }),
}));

const mockRemoveLabelMutate = jest.fn();
jest.mock("@/hooks/use-remove-card-label", () => ({
  useRemoveCardLabel: () => ({ mutate: mockRemoveLabelMutate }),
}));

const bugLabel: Label = {
  id: "lb1",
  name: "Bug",
  color: "#EF4444",
  boardId: "b1",
  createdAt: "2026-01-01T00:00:00.000Z",
};

const urgentLabel: Label = {
  id: "lb2",
  name: "Urgente",
  color: "#F97316",
  boardId: "b1",
  createdAt: "2026-01-01T00:00:00.000Z",
};

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

describe("CardLabels", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseLabels.mockReturnValue({
      data: [bugLabel, urgentLabel],
      isPending: false,
      isSuccess: true,
    });
  });

  it("mostra as etiquetas já anexadas ao card como chips", () => {
    renderWithProviders(<CardLabels card={card({ labels: [bugLabel] })} boardId="b1" />);

    expect(screen.getByText("Bug")).toBeInTheDocument();
  });

  it("botão diz 'Adicionar' sem etiquetas e 'Editar' com etiquetas", () => {
    const { rerender } = renderWithProviders(
      <CardLabels card={card()} boardId="b1" />
    );
    expect(screen.getByRole("button", { name: /adicionar/i })).toBeInTheDocument();

    rerender(<CardLabels card={card({ labels: [bugLabel] })} boardId="b1" />);
    expect(screen.getByRole("button", { name: /^editar$/i })).toBeInTheDocument();
  });

  it("anexa uma etiqueta ao clicar nela no dialog", async () => {
    renderWithProviders(<CardLabels card={card()} boardId="b1" />);

    await userEvent.click(screen.getByRole("button", { name: /adicionar/i }));
    const dialog = await screen.findByRole("dialog");
    await userEvent.click(within(dialog).getByText("Bug"));

    expect(mockAddLabelMutate).toHaveBeenCalledWith("lb1");
  });

  it("remove uma etiqueta já anexada ao clicar nela de novo", async () => {
    renderWithProviders(<CardLabels card={card({ labels: [bugLabel] })} boardId="b1" />);

    await userEvent.click(screen.getByRole("button", { name: /^editar$/i }));
    const dialog = await screen.findByRole("dialog");
    await userEvent.click(within(dialog).getByText("Bug"));

    expect(mockRemoveLabelMutate).toHaveBeenCalledWith("lb1");
  });

  it("cria uma nova etiqueta pelo formulário inline", async () => {
    renderWithProviders(<CardLabels card={card()} boardId="b1" />);

    await userEvent.click(screen.getByRole("button", { name: /adicionar/i }));
    const dialog = await screen.findByRole("dialog");
    await userEvent.click(
      within(dialog).getByRole("button", { name: /nova etiqueta/i })
    );
    await userEvent.type(
      within(dialog).getByPlaceholderText(/nome da etiqueta/i),
      "Frontend"
    );
    await userEvent.click(within(dialog).getByRole("button", { name: /^criar$/i }));

    expect(mockCreateLabelMutate).toHaveBeenCalledWith(
      { name: "Frontend", color: expect.any(String) },
      expect.anything()
    );
  });
});
