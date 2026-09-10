import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ApiError } from "@/lib/api-client";
import { QuickAddForm } from "@/app/(protected)/boards/[id]/quick-add-form";

function setup(onAdd = jest.fn().mockResolvedValue({})) {
  render(
    <QuickAddForm
      addLabel="Adicionar cartão"
      placeholder="Título do cartão"
      onAdd={onAdd}
    />
  );
  return onAdd;
}

describe("QuickAddForm", () => {
  it("começa fechado e abre ao clicar no botão", async () => {
    setup();

    expect(
      screen.queryByPlaceholderText("Título do cartão")
    ).not.toBeInTheDocument();

    await userEvent.click(
      screen.getByRole("button", { name: /adicionar cartão/i })
    );

    expect(
      screen.getByPlaceholderText("Título do cartão")
    ).toBeInTheDocument();
  });

  it("fecha ao pressionar Escape", async () => {
    setup();
    await userEvent.click(
      screen.getByRole("button", { name: /adicionar cartão/i })
    );

    await userEvent.type(
      screen.getByPlaceholderText("Título do cartão"),
      "algo{Escape}"
    );

    expect(
      screen.queryByPlaceholderText("Título do cartão")
    ).not.toBeInTheDocument();
  });

  it("envia o valor trimado e fecha ao concluir", async () => {
    const onAdd = setup();
    await userEvent.click(
      screen.getByRole("button", { name: /adicionar cartão/i })
    );

    await userEvent.type(
      screen.getByPlaceholderText("Título do cartão"),
      "  Revisar PR  "
    );
    await userEvent.click(screen.getByRole("button", { name: "Adicionar" }));

    await waitFor(() => expect(onAdd).toHaveBeenCalledWith("Revisar PR"));
    await waitFor(() =>
      expect(
        screen.queryByPlaceholderText("Título do cartão")
      ).not.toBeInTheDocument()
    );
  });

  it("mantém o form aberto e mostra a mensagem quando onAdd falha", async () => {
    const onAdd = jest
      .fn()
      .mockRejectedValue(new ApiError("Lista arquivada.", 400));
    setup(onAdd);
    await userEvent.click(
      screen.getByRole("button", { name: /adicionar cartão/i })
    );

    await userEvent.type(
      screen.getByPlaceholderText("Título do cartão"),
      "Novo cartão"
    );
    await userEvent.click(screen.getByRole("button", { name: "Adicionar" }));

    expect(await screen.findByText(/lista arquivada/i)).toBeInTheDocument();
    expect(
      screen.getByPlaceholderText("Título do cartão")
    ).toBeInTheDocument();
  });

  it("não chama onAdd quando o campo está vazio", async () => {
    const onAdd = setup();
    await userEvent.click(
      screen.getByRole("button", { name: /adicionar cartão/i })
    );

    expect(screen.getByRole("button", { name: "Adicionar" })).toBeDisabled();
    await userEvent.type(
      screen.getByPlaceholderText("Título do cartão"),
      "   "
    );
    expect(screen.getByRole("button", { name: "Adicionar" })).toBeDisabled();
    expect(onAdd).not.toHaveBeenCalled();
  });
});
