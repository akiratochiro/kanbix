import { prisma } from "../config/prisma";
import type { WorkspaceMember, WorkspaceRole, User } from "@prisma/client";

export const memberRepository = {
  async findManyByWorkspaceId(
    workspaceId: string
  ): Promise<(WorkspaceMember & { user: User })[]> {
    return prisma.workspaceMember.findMany({
      where: { workspaceId },
      include: { user: true },
      orderBy: { createdAt: "asc" },
    });
  },

  async countOwners(workspaceId: string): Promise<number> {
    return prisma.workspaceMember.count({
      where: { workspaceId, role: "OWNER" },
    });
  },

  async create(data: {
    workspaceId: string;
    userId: string;
    role: WorkspaceRole;
  }): Promise<WorkspaceMember> {
    return prisma.workspaceMember.create({ data });
  },

  async updateRole(
    workspaceId: string,
    userId: string,
    role: WorkspaceRole
  ): Promise<WorkspaceMember> {
    return prisma.workspaceMember.update({
      where: { userId_workspaceId: { userId, workspaceId } },
      data: { role },
    });
  },

  async delete(workspaceId: string, userId: string): Promise<void> {
    await prisma.workspaceMember.delete({
      where: { userId_workspaceId: { userId, workspaceId } },
    });
  },
};
