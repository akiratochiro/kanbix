import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { User } from "@kanbix/shared-types";
import { renderWithProviders } from "./test-utils";
import { ApiError } from "@/lib/api-client";
import { authService } from "@/services/auth.service";
import { AuthProvider, useAuth } from "@/lib/auth-context";

jest.mock("@/services/auth.service", () => ({
  authService: { login: jest.fn(), getMe: jest.fn() },
}));

const mockedGetMe = authService.getMe as jest.Mock;

const fakeUser: User = {
  id: "u1",
  name: "Ada Lovelace",
  email: "ada@example.com",
  avatarUrl: null,
  createdAt: "2026-01-01T00:00:00.000Z",
};

function Probe() {
  const { user, isLoading, login, logout } = useAuth();
  return (
    <div>
      <span data-testid="state">
        {isLoading ? "loading" : user ? `user:${user.name}` : "anon"}
      </span>
      <button onClick={() => login("new-token", fakeUser)}>do-login</button>
      <button onClick={logout}>do-logout</button>
    </div>
  );
}

function renderAuth() {
  return renderWithProviders(
    <AuthProvider>
      <Probe />
    </AuthProvider>
  );
}

beforeEach(() => {
  localStorage.clear();
});

describe("AuthProvider", () => {
  it("fica anônimo e não chama /me quando não há token", () => {
    renderAuth();

    expect(screen.getByTestId("state")).toHaveTextContent("anon");
    expect(mockedGetMe).not.toHaveBeenCalled();
  });

  it("busca /me e popula o usuário quando há token salvo", async () => {
    localStorage.setItem("kanbix_token", "saved-token");
    mockedGetMe.mockResolvedValue(fakeUser);

    renderAuth();

    await waitFor(() =>
      expect(screen.getByTestId("state")).toHaveTextContent("user:Ada Lovelace")
    );
    expect(mockedGetMe).toHaveBeenCalledTimes(1);
  });

  it("login() salva token e usuário sem chamar /me", async () => {
    renderAuth();

    await userEvent.click(screen.getByRole("button", { name: "do-login" }));

    expect(screen.getByTestId("state")).toHaveTextContent("user:Ada Lovelace");
    expect(localStorage.getItem("kanbix_token")).toBe("new-token");
    expect(mockedGetMe).not.toHaveBeenCalled();
  });

  it("logout() limpa token e usuário", async () => {
    renderAuth();
    await userEvent.click(screen.getByRole("button", { name: "do-login" }));

    await userEvent.click(screen.getByRole("button", { name: "do-logout" }));

    expect(screen.getByTestId("state")).toHaveTextContent("anon");
    expect(localStorage.getItem("kanbix_token")).toBeNull();
  });

  it("descarta o token quando /me responde 401", async () => {
    localStorage.setItem("kanbix_token", "bad-token");
    mockedGetMe.mockRejectedValue(new ApiError("Não autorizado.", 401));

    renderAuth();

    await waitFor(() =>
      expect(localStorage.getItem("kanbix_token")).toBeNull()
    );
    expect(screen.getByTestId("state")).toHaveTextContent("anon");
  });
});
