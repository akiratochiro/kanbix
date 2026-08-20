import { prisma } from "../config/prisma";
import type { Board as PrismaBoard } from "@prisma/client";

export interface CreateBoardData {
  name: string;
  description?: string;
  color?: string;
  workspaceId: string;
  createdById: string;
}

export interface UpdateBoardData {
  name?: string;
  description?: string;
  color?: string;
}

export const boardRepository = {
  async create(data: CreateBoardData): Promise<PrismaBoard> {
    return prisma.board.create({ data });
  },

  async findById(id: string): Promise<PrismaBoard | null> {
    return prisma.board.findUnique({ where: { id } });
  },

  async findManyByWorkspaceId(workspaceId: string): Promise<PrismaBoard[]> {
    return prisma.board.findMany({
      where: { workspaceId },
      orderBy: { createdAt: "desc" },
    });
  },

  async update(id: string, data: UpdateBoardData): Promise<PrismaBoard> {
    return prisma.board.update({ where: { id }, data });
  },

  async delete(id: string): Promise<void> {
    await prisma.board.delete({ where: { id } });
  },
};