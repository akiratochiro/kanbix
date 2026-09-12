import { screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { WorkspaceMember } from "@kanbix/shared-types";
import { renderWithProviders } from "./test-utils";
import { ApiError } from "@/lib/api-client";
import { memberService } from "@/services/member.service";
import { InviteMemberDialog } from "@/app/(protected)/workspaces/[id]/invite-member-dialog";

jest.mock("@/services/member.service", () => ({
  memberService: { add: jest.fn() },
}));

const mockedAdd = memberService.add as jest.Mock;

const addedMember: WorkspaceMember = {
  userId: "u2",
  name: "Convidada",
  email: "convidada@example.com",
  avatarUrl: null,
  role: "MEMBER",
  joinedAt: "2026-01-01T00:00:00.000Z",
};

function setup() {
  return renderWithProviders(
    <InviteMemberDialog workspaceId="w1" trigger={<button>abrir</button>} />
  );
}

async function open() {
  await userEvent.click(screen.getByRole("button", { name: "abrir" }));
  return screen.findByRole("dialog");
}

describe("InviteMemberDialog", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("bloqueia o envio quando o e-mail é inválido", async () => {
    setup();
    const dialog = await open();

    await userEvent.type(within(dialog).getByLabelText(/e-mail/i), "não-é-email");
    await userEvent.click(
      within(dialog).getByRole("button", { name: /adicionar/i })
    );

    expect(
      await within(dialog).findByText(/informe um e-mail válido/i)
    ).toBeInTheDocument();
    expect(mockedAdd).not.toHaveBeenCalled();
  });

  it("envia o e-mail e o papel escolhido, com Membro como padrão", async () => {
    mockedAdd.mockResolvedValue(addedMember);
    setup();
    const dialog = await open();

    await userEvent.type(
      within(dialog).getByLabelText(/e-mail/i),
      "convidada@example.com"
    );
    await userEvent.click(
      within(dialog).getByRole("button", { name: /adicionar/i })
    );

    await waitFor(() =>
      expect(mockedAdd).toHaveBeenCalledWith("w1", {
        email: "convidada@example.com",
        role: "MEMBER",
      })
    );
  });

  it("fecha o dialog no sucesso", async () => {
    mockedAdd.mockResolvedValue(addedMember);
    setup();
    const dialog = await open();

    await userEvent.type(
      within(dialog).getByLabelText(/e-mail/i),
      "convidada@example.com"
    );
    await userEvent.click(
      within(dialog).getByRole("button", { name: /adicionar/i })
    );

    await waitFor(() =>
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument()
    );
  });

  it("mostra a mensagem do servidor quando a API falha", async () => {
    mockedAdd.mockRejectedValue(new ApiError("Usuário não encontrado.", 404));
    setup();
    const dialog = await open();

    await userEvent.type(
      within(dialog).getByLabelText(/e-mail/i),
      "ninguem@example.com"
    );
    await userEvent.click(
      within(dialog).getByRole("button", { name: /adicionar/i })
    );

    expect(
      await within(dialog).findByText(/usuário não encontrado/i)
    ).toBeInTheDocument();
    expect(screen.getByRole("dialog")).toBeInTheDocument();
  });
});
