import { screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { Label, WorkspaceMember } from "@kanbix/shared-types";
import { renderWithProviders } from "./test-utils";
import { BoardFiltersBar } from "@/app/(protected)/boards/[id]/board-filters-bar";
import { EMPTY_FILTERS } from "@/app/(protected)/boards/[id]/board-filters";

const mockUseLabels = jest.fn();
jest.mock("@/hooks/use-labels", () => ({
  useLabels: () => mockUseLabels(),
}));

const mockUseMembers = jest.fn();
jest.mock("@/hooks/use-members", () => ({
  useMembers: () => mockUseMembers(),
}));

const mockSetFilters = jest.fn();
const mockUseBoardFilters = jest.fn();
jest.mock("@/app/(protected)/boards/[id]/board-filters-context", () => ({
  useBoardFilters: () => mockUseBoardFilters(),
}));

const bugLabel: Label = {
  id: "lb1",
  name: "Bug",
  color: "#EF4444",
  boardId: "b1",
  createdAt: "2026-01-01T00:00:00.000Z",
};

const member: WorkspaceMember = {
  userId: "u1",
  name: "Ada Lovelace",
  email: "ada@example.com",
  avatarUrl: null,
  role: "MEMBER",
  joinedAt: "2026-01-01T00:00:00.000Z",
};

function setup(filters = EMPTY_FILTERS) {
  mockUseBoardFilters.mockReturnValue({ filters, setFilters: mockSetFilters });
  return renderWithProviders(
    <BoardFiltersBar boardId="b1" workspaceId="w1" />
  );
}

describe("BoardFiltersBar", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseLabels.mockReturnValue({ data: [bugLabel], isPending: false });
    mockUseMembers.mockReturnValue({ data: [member], isPending: false });
  });

  it("não mostra 'Limpar filtros' quando nada está filtrado", () => {
    setup();

    expect(
      screen.queryByRole("button", { name: /limpar filtros/i })
    ).not.toBeInTheDocument();
  });

  it("liga um filtro de prioridade ao clicar no chip", async () => {
    setup();

    const group = screen.getByRole("group", { name: /filtrar por prioridade/i });
    await userEvent.click(within(group).getByText("Alta"));

    expect(mockSetFilters).toHaveBeenCalledWith(
      expect.objectContaining({ priorities: new Set(["HIGH"]) })
    );
  });

  it("desliga um filtro de prioridade já ativo", async () => {
    setup({ ...EMPTY_FILTERS, priorities: new Set(["HIGH"]) });

    const group = screen.getByRole("group", { name: /filtrar por prioridade/i });
    await userEvent.click(within(group).getByText("Alta"));

    expect(mockSetFilters).toHaveBeenCalledWith(
      expect.objectContaining({ priorities: new Set() })
    );
  });

  it("liga um filtro de etiqueta ao clicar no chip", async () => {
    setup();

    const group = screen.getByRole("group", { name: /filtrar por etiqueta/i });
    await userEvent.click(within(group).getByText("Bug"));

    expect(mockSetFilters).toHaveBeenCalledWith(
      expect.objectContaining({ labelIds: new Set(["lb1"]) })
    );
  });

  it("liga o filtro de atrasados", async () => {
    setup();

    await userEvent.click(screen.getByRole("button", { name: /atrasados/i }));

    expect(mockSetFilters).toHaveBeenCalledWith(
      expect.objectContaining({ overdueOnly: true })
    );
  });

  it("mostra e usa 'Limpar filtros' quando algo está ativo", async () => {
    setup({ ...EMPTY_FILTERS, overdueOnly: true });

    await userEvent.click(
      screen.getByRole("button", { name: /limpar filtros/i })
    );

    expect(mockSetFilters).toHaveBeenCalledWith(EMPTY_FILTERS);
  });
});
