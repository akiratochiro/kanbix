import { memberService } from "../services/member.service";
import { memberRepository } from "../repositories/member.repository";
import { workspaceRepository } from "../repositories/workspace.repository";
import { userRepository } from "../repositories/user.repository";
import {
  UserNotFoundError,
  MemberAlreadyExistsError,
  MemberNotFoundError,
  LastOwnerError,
  InsufficientPermissionError,
} from "../utils/errors";

jest.mock("../repositories/member.repository");
jest.mock("../repositories/workspace.repository");
jest.mock("../repositories/user.repository");

const mockedMemberRepository = memberRepository as jest.Mocked<typeof memberRepository>;
const mockedWorkspaceRepository = workspaceRepository as jest.Mocked<typeof workspaceRepository>;
const mockedUserRepository = userRepository as jest.Mocked<typeof userRepository>;

const fakeUser = {
  id: "user-uuid",
  name: "Maria Silva",
  email: "maria@example.com",
  passwordHash: "hash",
  avatarUrl: null,
  createdAt: new Date(),
  updatedAt: new Date(),
};

const fakeMembership = {
  id: "member-uuid",
  role: "MEMBER" as const,
  createdAt: new Date(),
  userId: "user-uuid",
  workspaceId: "workspace-uuid",
};

describe("memberService", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("listMembers", () => {
    it("deve retornar os membros mapeados com os dados do usuário", async () => {
      mockedMemberRepository.findManyByWorkspaceId.mockResolvedValue([
        { ...fakeMembership, user: fakeUser },
      ]);

      const result = await memberService.listMembers("workspace-uuid");

      expect(result).toEqual([
        {
          userId: "user-uuid",
          name: "Maria Silva",
          email: "maria@example.com",
          avatarUrl: null,
          role: "MEMBER",
          joinedAt: fakeMembership.createdAt.toISOString(),
        },
      ]);
    });
  });

  describe("addMember", () => {
    it("deve adicionar o usuário como membro quando ele existe e ainda não é membro", async () => {
      mockedUserRepository.findByEmail.mockResolvedValue(fakeUser);
      mockedWorkspaceRepository.findMembership.mockResolvedValue(null);
      mockedMemberRepository.create.mockResolvedValue(fakeMembership);

      const result = await memberService.addMember("workspace-uuid", {
        email: "maria@example.com",
        role: "MEMBER",
      });

      expect(mockedMemberRepository.create).toHaveBeenCalledWith({
        workspaceId: "workspace-uuid",
        userId: "user-uuid",
        role: "MEMBER",
      });
      expect(result.email).toBe("maria@example.com");
    });

    it("deve lançar UserNotFoundError quando o e-mail não corresponde a ninguém", async () => {
      mockedUserRepository.findByEmail.mockResolvedValue(null);

      await expect(
        memberService.addMember("workspace-uuid", { email: "x@x.com", role: "MEMBER" })
      ).rejects.toThrow(UserNotFoundError);
      expect(mockedMemberRepository.create).not.toHaveBeenCalled();
    });

    it("deve lançar MemberAlreadyExistsError quando o usuário já é membro", async () => {
      mockedUserRepository.findByEmail.mockResolvedValue(fakeUser);
      mockedWorkspaceRepository.findMembership.mockResolvedValue(fakeMembership);

      await expect(
        memberService.addMember("workspace-uuid", {
          email: "maria@example.com",
          role: "MEMBER",
        })
      ).rejects.toThrow(MemberAlreadyExistsError);
      expect(mockedMemberRepository.create).not.toHaveBeenCalled();
    });
  });

  describe("updateMemberRole", () => {
    it("deve atualizar o papel do membro", async () => {
      mockedWorkspaceRepository.findMembership.mockResolvedValue(fakeMembership);
      mockedMemberRepository.updateRole.mockResolvedValue({ ...fakeMembership, role: "ADMIN" });
      mockedUserRepository.findById.mockResolvedValue(fakeUser);

      const result = await memberService.updateMemberRole(
        "workspace-uuid",
        "user-uuid",
        "ADMIN"
      );

      expect(result.role).toBe("ADMIN");
    });

    it("deve lançar MemberNotFoundError quando o alvo não é membro", async () => {
      mockedWorkspaceRepository.findMembership.mockResolvedValue(null);

      await expect(
        memberService.updateMemberRole("workspace-uuid", "user-uuid", "ADMIN")
      ).rejects.toThrow(MemberNotFoundError);
    });

    it("deve lançar LastOwnerError ao rebaixar o único Dono", async () => {
      mockedWorkspaceRepository.findMembership.mockResolvedValue({
        ...fakeMembership,
        role: "OWNER",
      });
      mockedMemberRepository.countOwners.mockResolvedValue(1);

      await expect(
        memberService.updateMemberRole("workspace-uuid", "user-uuid", "ADMIN")
      ).rejects.toThrow(LastOwnerError);
      expect(mockedMemberRepository.updateRole).not.toHaveBeenCalled();
    });

    it("permite rebaixar um Dono quando há outros Donos", async () => {
      mockedWorkspaceRepository.findMembership.mockResolvedValue({
        ...fakeMembership,
        role: "OWNER",
      });
      mockedMemberRepository.countOwners.mockResolvedValue(2);
      mockedMemberRepository.updateRole.mockResolvedValue({ ...fakeMembership, role: "ADMIN" });
      mockedUserRepository.findById.mockResolvedValue(fakeUser);

      const result = await memberService.updateMemberRole(
        "workspace-uuid",
        "user-uuid",
        "ADMIN"
      );

      expect(result.role).toBe("ADMIN");
    });
  });

  describe("removeMember", () => {
    it("permite que um ADMIN remova um MEMBER", async () => {
      mockedWorkspaceRepository.findMembership.mockResolvedValue(fakeMembership);

      await memberService.removeMember("workspace-uuid", "user-uuid", "ADMIN");

      expect(mockedMemberRepository.delete).toHaveBeenCalledWith(
        "workspace-uuid",
        "user-uuid"
      );
    });

    it("não permite que um ADMIN remova outro ADMIN", async () => {
      mockedWorkspaceRepository.findMembership.mockResolvedValue({
        ...fakeMembership,
        role: "ADMIN",
      });

      await expect(
        memberService.removeMember("workspace-uuid", "user-uuid", "ADMIN")
      ).rejects.toThrow(InsufficientPermissionError);
      expect(mockedMemberRepository.delete).not.toHaveBeenCalled();
    });

    it("não permite que um ADMIN remova o Dono", async () => {
      mockedWorkspaceRepository.findMembership.mockResolvedValue({
        ...fakeMembership,
        role: "OWNER",
      });

      await expect(
        memberService.removeMember("workspace-uuid", "user-uuid", "ADMIN")
      ).rejects.toThrow(InsufficientPermissionError);
    });

    it("permite que o Dono remova um ADMIN", async () => {
      mockedWorkspaceRepository.findMembership.mockResolvedValue({
        ...fakeMembership,
        role: "ADMIN",
      });

      await memberService.removeMember("workspace-uuid", "user-uuid", "OWNER");

      expect(mockedMemberRepository.delete).toHaveBeenCalledWith(
        "workspace-uuid",
        "user-uuid"
      );
    });

    it("deve lançar LastOwnerError ao tentar remover o único Dono", async () => {
      mockedWorkspaceRepository.findMembership.mockResolvedValue({
        ...fakeMembership,
        role: "OWNER",
      });
      mockedMemberRepository.countOwners.mockResolvedValue(1);

      await expect(
        memberService.removeMember("workspace-uuid", "user-uuid", "OWNER")
      ).rejects.toThrow(LastOwnerError);
      expect(mockedMemberRepository.delete).not.toHaveBeenCalled();
    });

    it("deve lançar MemberNotFoundError quando o alvo não é membro", async () => {
      mockedWorkspaceRepository.findMembership.mockResolvedValue(null);

      await expect(
        memberService.removeMember("workspace-uuid", "user-uuid", "OWNER")
      ).rejects.toThrow(MemberNotFoundError);
    });
  });
});
