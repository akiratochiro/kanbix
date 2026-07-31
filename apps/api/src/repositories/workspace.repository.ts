import { prisma } from "../config/prisma";
import type { Workspace as PrismaWorkspace, WorkspaceRole } from "@prisma/client";

export interface CreateWorkspaceData {
  name: string;
  description?: string;
  ownerId: string;
}

export const workspaceRepository = {
  async create(data: CreateWorkspaceData): Promise<PrismaWorkspace> {
    return prisma.$transaction(async (tx) => {
      const workspace = await tx.workspace.create({
        data: {
          name: data.name,
          description: data.description,
        },
      });

      await tx.workspaceMember.create({
        data: {
          userId: data.ownerId,
          workspaceId: workspace.id,
          role: "OWNER",
        },
      });

      return workspace;
    });
  },

  async findById(id: string): Promise<PrismaWorkspace | null> {
    return prisma.workspace.findUnique({ where: { id } });
  },

  async findMembership(userId: string, workspaceId: string) {
    return prisma.workspaceMember.findUnique({
      where: {
        userId_workspaceId: { userId, workspaceId },
      },
    });
  },
};