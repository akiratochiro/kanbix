import { screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { WorkspaceMember } from "@kanbix/shared-types";
import { renderWithProviders } from "./test-utils";
import { memberService } from "@/services/member.service";
import { MembersSection } from "@/app/(protected)/workspaces/[id]/members-section";

jest.mock("@/services/member.service", () => ({
  memberService: {
    listByWorkspace: jest.fn(),
    add: jest.fn(),
    updateRole: jest.fn(),
    remove: jest.fn(),
  },
}));

const mockedListByWorkspace = memberService.listByWorkspace as jest.Mock;
const mockedRemove = memberService.remove as jest.Mock;

const member = (over: Partial<WorkspaceMember> = {}): WorkspaceMember => ({
  userId: "u1",
  name: "Ada Lovelace",
  email: "ada@example.com",
  avatarUrl: null,
  role: "MEMBER",
  joinedAt: "2026-01-01T00:00:00.000Z",
  ...over,
});

function setup(props: {
  currentUserId: string;
  currentUserRole: "OWNER" | "ADMIN" | "MEMBER";
}) {
  return renderWithProviders(
    <MembersSection workspaceId="w1" {...props} />
  );
}

describe("MembersSection", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("mostra 'Convidar membro' para OWNER e ADMIN, mas não para MEMBER", async () => {
    mockedListByWorkspace.mockResolvedValue([member()]);

    const { rerender } = setup({ currentUserId: "owner", currentUserRole: "OWNER" });
    expect(
      await screen.findByRole("button", { name: /convidar membro/i })
    ).toBeInTheDocument();

    rerender(<MembersSection workspaceId="w1" currentUserId="admin" currentUserRole="ADMIN" />);
    expect(
      await screen.findByRole("button", { name: /convidar membro/i })
    ).toBeInTheDocument();

    rerender(<MembersSection workspaceId="w1" currentUserId="member" currentUserRole="MEMBER" />);
    await screen.findByText("Ada Lovelace");
    expect(
      screen.queryByRole("button", { name: /convidar membro/i })
    ).not.toBeInTheDocument();
  });

  it("não mostra controles na própria linha do usuário logado", async () => {
    mockedListByWorkspace.mockResolvedValue([member({ userId: "owner", name: "Eu Mesmo" })]);

    setup({ currentUserId: "owner", currentUserRole: "OWNER" });

    expect(await screen.findByText(/eu mesmo \(você\)/i)).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: /remover/i })
    ).not.toBeInTheDocument();
    expect(screen.queryByRole("combobox")).not.toBeInTheDocument();
  });

  it("ADMIN não pode remover outro ADMIN nem o OWNER, só MEMBER", async () => {
    mockedListByWorkspace.mockResolvedValue([
      member({ userId: "u1", name: "Colega Membro", role: "MEMBER" }),
      member({ userId: "u2", name: "Colega Admin", role: "ADMIN" }),
      member({ userId: "u3", name: "A Dona", role: "OWNER" }),
    ]);

    setup({ currentUserId: "admin", currentUserRole: "ADMIN" });

    await screen.findByText("Colega Membro");
    const removeButtons = screen.getAllByRole("button", { name: /remover/i });
    expect(removeButtons).toHaveLength(1);
  });

  it("OWNER pode trocar o papel de um membro (menos o próprio)", async () => {
    mockedListByWorkspace.mockResolvedValue([member({ userId: "u1", role: "MEMBER" })]);

    setup({ currentUserId: "owner", currentUserRole: "OWNER" });

    expect(await screen.findByRole("combobox")).toBeInTheDocument();
  });

  it("remove um membro após confirmar", async () => {
    mockedListByWorkspace.mockResolvedValue([member({ userId: "u1", name: "Ada Lovelace" })]);
    mockedRemove.mockResolvedValue(undefined);

    setup({ currentUserId: "owner", currentUserRole: "OWNER" });

    await userEvent.click(
      await screen.findByRole("button", { name: /^remover$/i })
    );
    const dialog = await screen.findByRole("alertdialog");
    await userEvent.click(
      within(dialog).getByRole("button", { name: /^remover$/i })
    );

    await waitFor(() => expect(mockedRemove).toHaveBeenCalledWith("w1", "u1"));
  });
});
