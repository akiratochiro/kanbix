import { render, screen, waitFor } from "@testing-library/react";
import type { User } from "@kanbix/shared-types";
import ProtectedLayout from "@/app/(protected)/layout";

const replace = jest.fn();
jest.mock("next/navigation", () => ({
  useRouter: () => ({ replace, push: jest.fn() }),
}));

let mockAuthValue: { user: User | null; isLoading: boolean };
jest.mock("@/lib/auth-context", () => ({
  useAuth: () => mockAuthValue,
}));

const fakeUser: User = {
  id: "u1",
  name: "Ada Lovelace",
  email: "ada@example.com",
  avatarUrl: null,
  createdAt: "2026-01-01T00:00:00.000Z",
};

function renderLayout() {
  return render(
    <ProtectedLayout>
      <div>conteúdo protegido</div>
    </ProtectedLayout>
  );
}

describe("ProtectedLayout", () => {
  it("redireciona para /login quando não há usuário", async () => {
    mockAuthValue = { user: null, isLoading: false };
    renderLayout();

    await waitFor(() => expect(replace).toHaveBeenCalledWith("/login"));
    expect(screen.queryByText("conteúdo protegido")).not.toBeInTheDocument();
  });

  it("mostra o spinner enquanto a sessão está carregando", () => {
    mockAuthValue = { user: null, isLoading: true };
    renderLayout();

    expect(screen.getByRole("status")).toBeInTheDocument();
    expect(replace).not.toHaveBeenCalled();
    expect(screen.queryByText("conteúdo protegido")).not.toBeInTheDocument();
  });

  it("renderiza os filhos quando o usuário está autenticado", () => {
    mockAuthValue = { user: fakeUser, isLoading: false };
    renderLayout();

    expect(screen.getByText("conteúdo protegido")).toBeInTheDocument();
    expect(replace).not.toHaveBeenCalled();
  });
});
