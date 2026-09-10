import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { User } from "@kanbix/shared-types";
import { renderWithProviders } from "./test-utils";
import { ApiError } from "@/lib/api-client";
import { authService } from "@/services/auth.service";
import RegisterPage from "@/app/register/page";

const push = jest.fn();
jest.mock("next/navigation", () => ({
  useRouter: () => ({ push, replace: jest.fn() }),
}));

const authLogin = jest.fn();
jest.mock("@/lib/auth-context", () => ({
  useAuth: () => ({ login: authLogin, logout: jest.fn(), user: null, isLoading: false }),
}));

jest.mock("@/services/auth.service", () => ({
  authService: { register: jest.fn(), login: jest.fn(), getMe: jest.fn() },
}));

const mockedRegister = authService.register as jest.Mock;
const mockedLogin = authService.login as jest.Mock;

const fakeUser: User = {
  id: "u1",
  name: "Ada Lovelace",
  email: "ada@example.com",
  avatarUrl: null,
  createdAt: "2026-01-01T00:00:00.000Z",
};

async function fill(over: Partial<Record<
  "name" | "email" | "password" | "confirmPassword",
  string
>> = {}) {
  const user = userEvent.setup();
  const values = {
    name: "Ada Lovelace",
    email: "ada@example.com",
    password: "secret123",
    confirmPassword: "secret123",
    ...over,
  };
  await user.type(screen.getByLabelText(/nome/i), values.name);
  await user.type(screen.getByLabelText(/e-mail/i), values.email);
  await user.type(screen.getByLabelText(/^senha$/i), values.password);
  await user.type(
    screen.getByLabelText(/confirmar senha/i),
    values.confirmPassword
  );
  await user.click(screen.getByRole("button", { name: /criar conta/i }));
}

describe("RegisterPage", () => {
  it("renderiza os campos de cadastro", () => {
    renderWithProviders(<RegisterPage />);

    expect(screen.getByLabelText(/nome/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/e-mail/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^senha$/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/confirmar senha/i)).toBeInTheDocument();
  });

  it("bloqueia o envio quando as senhas não conferem", async () => {
    renderWithProviders(<RegisterPage />);

    await fill({ confirmPassword: "outra-coisa" });

    expect(
      await screen.findByText(/as senhas não conferem/i)
    ).toBeInTheDocument();
    expect(mockedRegister).not.toHaveBeenCalled();
  });

  it("cadastra, autentica e navega para /workspaces", async () => {
    mockedRegister.mockResolvedValue(fakeUser);
    mockedLogin.mockResolvedValue({ user: fakeUser, token: "jwt-token" });
    renderWithProviders(<RegisterPage />);

    await fill();

    await waitFor(() =>
      expect(authLogin).toHaveBeenCalledWith("jwt-token", fakeUser)
    );
    expect(mockedRegister.mock.calls[0][0]).toEqual({
      name: "Ada Lovelace",
      email: "ada@example.com",
      password: "secret123",
    });
    expect(mockedLogin).toHaveBeenCalledWith({
      email: "ada@example.com",
      password: "secret123",
    });
    expect(push).toHaveBeenCalledWith("/workspaces");
  });

  it("mostra a mensagem do servidor quando o e-mail já existe", async () => {
    mockedRegister.mockRejectedValue(
      new ApiError("E-mail já cadastrado.", 409)
    );
    renderWithProviders(<RegisterPage />);

    await fill();

    expect(
      await screen.findByText(/e-mail já cadastrado\./i)
    ).toBeInTheDocument();
    expect(push).not.toHaveBeenCalled();
  });
});
