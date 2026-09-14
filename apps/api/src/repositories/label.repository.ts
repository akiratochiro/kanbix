import { prisma } from "../config/prisma";
import type { Label as PrismaLabel } from "@prisma/client";

export interface CreateLabelData {
  name: string;
  color: string;
  boardId: string;
}

export interface UpdateLabelData {
  name?: string;
  color?: string;
}

export const labelRepository = {
  async create(data: CreateLabelData): Promise<PrismaLabel> {
    return prisma.label.create({ data });
  },

  async findById(id: string): Promise<PrismaLabel | null> {
    return prisma.label.findUnique({ where: { id } });
  },

  async findManyByBoardId(boardId: string): Promise<PrismaLabel[]> {
    return prisma.label.findMany({
      where: { boardId },
      orderBy: { createdAt: "asc" },
    });
  },

  async update(id: string, data: UpdateLabelData): Promise<PrismaLabel> {
    return prisma.label.update({ where: { id }, data });
  },

  async delete(id: string): Promise<void> {
    await prisma.label.delete({ where: { id } });
  },
};
