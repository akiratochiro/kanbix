import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ListTitle } from "@/app/(protected)/boards/[id]/list-title";

const mockUpdateListMutate = jest.fn();
jest.mock("@/hooks/use-update-list", () => ({
  useUpdateList: () => ({ mutate: mockUpdateListMutate }),
}));

describe("ListTitle", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("mostra o nome como texto por padrão", () => {
    render(<ListTitle listId="l1" boardId="b1" name="A Fazer" />);

    expect(screen.getByRole("button", { name: "A Fazer" })).toBeInTheDocument();
  });

  it("vira um input ao clicar, e salva com Enter", async () => {
    render(<ListTitle listId="l1" boardId="b1" name="A Fazer" />);

    await userEvent.click(screen.getByRole("button", { name: "A Fazer" }));
    const input = screen.getByRole("textbox", { name: /nome da lista/i });
    await userEvent.clear(input);
    await userEvent.type(input, "Em Progresso{Enter}");

    expect(mockUpdateListMutate).toHaveBeenCalledWith({
      listId: "l1",
      name: "Em Progresso",
    });
  });

  it("salva ao perder o foco (blur)", async () => {
    render(<ListTitle listId="l1" boardId="b1" name="A Fazer" />);

    await userEvent.click(screen.getByRole("button", { name: "A Fazer" }));
    const input = screen.getByRole("textbox", { name: /nome da lista/i });
    await userEvent.clear(input);
    await userEvent.type(input, "Feito");
    await userEvent.tab();

    expect(mockUpdateListMutate).toHaveBeenCalledWith({ listId: "l1", name: "Feito" });
  });

  it("cancela com Escape sem salvar", async () => {
    render(<ListTitle listId="l1" boardId="b1" name="A Fazer" />);

    await userEvent.click(screen.getByRole("button", { name: "A Fazer" }));
    const input = screen.getByRole("textbox", { name: /nome da lista/i });
    await userEvent.type(input, " mudou{Escape}");

    expect(mockUpdateListMutate).not.toHaveBeenCalled();
    expect(screen.getByRole("button", { name: "A Fazer" })).toBeInTheDocument();
  });

  it("não salva quando o nome fica vazio", async () => {
    render(<ListTitle listId="l1" boardId="b1" name="A Fazer" />);

    await userEvent.click(screen.getByRole("button", { name: "A Fazer" }));
    const input = screen.getByRole("textbox", { name: /nome da lista/i });
    await userEvent.clear(input);
    await userEvent.tab();

    expect(mockUpdateListMutate).not.toHaveBeenCalled();
  });

  it("não salva quando o nome não mudou", async () => {
    render(<ListTitle listId="l1" boardId="b1" name="A Fazer" />);

    await userEvent.click(screen.getByRole("button", { name: "A Fazer" }));
    await userEvent.tab();

    expect(mockUpdateListMutate).not.toHaveBeenCalled();
  });
});
