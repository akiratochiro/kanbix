import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { User } from "@kanbix/shared-types";
import { renderWithProviders } from "./test-utils";
import { ApiError } from "@/lib/api-client";
import { authService } from "@/services/auth.service";
import LoginPage from "@/app/login/page";

const push = jest.fn();
jest.mock("next/navigation", () => ({
  useRouter: () => ({ push, replace: jest.fn() }),
}));

const authLogin = jest.fn();
jest.mock("@/lib/auth-context", () => ({
  useAuth: () => ({
    login: authLogin,
    logout: jest.fn(),
    user: null,
    isLoading: false,
  }),
}));

jest.mock("@/services/auth.service", () => ({
  authService: { login: jest.fn(), getMe: jest.fn() },
}));

const mockedLogin = authService.login as jest.Mock;

const fakeUser: User = {
  id: "u1",
  name: "Ada Lovelace",
  email: "ada@example.com",
  avatarUrl: null,
  createdAt: "2026-01-01T00:00:00.000Z",
};

async function fillAndSubmit(email: string, password: string) {
  const user = userEvent.setup();
  if (email) await user.type(screen.getByLabelText(/e-mail/i), email);
  if (password) await user.type(screen.getByLabelText(/senha/i), password);
  await user.click(screen.getByRole("button", { name: /entrar/i }));
}

describe("LoginPage", () => {
  it("renderiza os campos de e-mail e senha e o botão", () => {
    renderWithProviders(<LoginPage />);

    expect(screen.getByLabelText(/e-mail/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/senha/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /entrar/i })).toBeInTheDocument();
  });

  it("bloqueia o envio e mostra erro quando o e-mail é inválido", async () => {
    renderWithProviders(<LoginPage />);

    await fillAndSubmit("not-an-email", "secret123");

    expect(
      await screen.findByText(/informe um e-mail válido/i)
    ).toBeInTheDocument();
    expect(mockedLogin).not.toHaveBeenCalled();
  });

  it("chama login e navega para /workspaces em caso de sucesso", async () => {
    mockedLogin.mockResolvedValue({ user: fakeUser, token: "jwt-token" });
    renderWithProviders(<LoginPage />);

    await fillAndSubmit("ada@example.com", "secret123");

    await waitFor(() =>
      expect(authLogin).toHaveBeenCalledWith("jwt-token", fakeUser)
    );
    expect(push).toHaveBeenCalledWith("/workspaces");
    // useMutation chama mutationFn(variables, context) — só as variáveis nos interessam.
    expect(mockedLogin.mock.calls[0][0]).toEqual({
      email: "ada@example.com",
      password: "secret123",
    });
  });

  it("exibe a mensagem do servidor quando a API retorna ApiError", async () => {
    mockedLogin.mockRejectedValue(new ApiError("Credenciais inválidas.", 401));
    renderWithProviders(<LoginPage />);

    await fillAndSubmit("ada@example.com", "wrong-pass");

    expect(
      await screen.findByText(/credenciais inválidas\./i)
    ).toBeInTheDocument();
    expect(push).not.toHaveBeenCalled();
  });

  it("desabilita o botão enquanto o login está em andamento", async () => {
    // Promise que nunca resolve: mantém a mutation em isPending.
    mockedLogin.mockReturnValue(new Promise(() => {}));
    renderWithProviders(<LoginPage />);

    await fillAndSubmit("ada@example.com", "secret123");

    await waitFor(() =>
      expect(screen.getByRole("button", { name: /entrando/i })).toBeDisabled()
    );
  });
});
