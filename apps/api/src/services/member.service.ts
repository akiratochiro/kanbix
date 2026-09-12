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
import type { WorkspaceMember } from "@kanbix/shared-types";
import type { WorkspaceMember as PrismaWorkspaceMember, User, WorkspaceRole } from "@prisma/client";

interface AddMemberInput {
  email: string;
  role: "ADMIN" | "MEMBER";
}

function toDTO(
  member: PrismaWorkspaceMember,
  user: Pick<User, "id" | "name" | "email" | "avatarUrl">
): WorkspaceMember {
  return {
    userId: user.id,
    name: user.name,
    email: user.email,
    avatarUrl: user.avatarUrl,
    role: member.role,
    joinedAt: member.createdAt.toISOString(),
  };
}

async function assertNotLastOwner(workspaceId: string): Promise<void> {
  const ownerCount = await memberRepository.countOwners(workspaceId);
  if (ownerCount <= 1) {
    throw new LastOwnerError();
  }
}

export const memberService = {
  async listMembers(workspaceId: string): Promise<WorkspaceMember[]> {
    const members = await memberRepository.findManyByWorkspaceId(workspaceId);
    return members.map((member) => toDTO(member, member.user));
  },

  async addMember(workspaceId: string, input: AddMemberInput): Promise<WorkspaceMember> {
    const user = await userRepository.findByEmail(input.email);
    if (!user) throw new UserNotFoundError();

    const existing = await workspaceRepository.findMembership(user.id, workspaceId);
    if (existing) throw new MemberAlreadyExistsError();

    const member = await memberRepository.create({
      workspaceId,
      userId: user.id,
      role: input.role,
    });

    return toDTO(member, user);
  },

  async updateMemberRole(
    workspaceId: string,
    targetUserId: string,
    role: WorkspaceRole
  ): Promise<WorkspaceMember> {
    const membership = await workspaceRepository.findMembership(targetUserId, workspaceId);
    if (!membership) throw new MemberNotFoundError();

    if (membership.role === "OWNER" && role !== "OWNER") {
      await assertNotLastOwner(workspaceId);
    }

    const updated = await memberRepository.updateRole(workspaceId, targetUserId, role);
    const user = await userRepository.findById(targetUserId);
    return toDTO(updated, user!);
  },

  async removeMember(
    workspaceId: string,
    targetUserId: string,
    actingUserRole: WorkspaceRole
  ): Promise<void> {
    const membership = await workspaceRepository.findMembership(targetUserId, workspaceId);
    if (!membership) throw new MemberNotFoundError();

    if (actingUserRole === "ADMIN" && membership.role !== "MEMBER") {
      throw new InsufficientPermissionError();
    }

    if (membership.role === "OWNER") {
      await assertNotLastOwner(workspaceId);
    }

    await memberRepository.delete(workspaceId, targetUserId);
  },
};
