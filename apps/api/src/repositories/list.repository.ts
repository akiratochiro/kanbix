import { prisma } from "../config/prisma";
import type { List as PrismaList } from "@prisma/client";

export interface CreateListData {
  name: string;
  boardId: string;
}

export const listRepository = {
  async create(data: CreateListData): Promise<PrismaList> {
    const count = await prisma.list.count({ where: { boardId: data.boardId } });
    return prisma.list.create({ data: { ...data, position: count } });
  },

  async findById(id: string): Promise<PrismaList | null> {
    return prisma.list.findUnique({ where: { id } });
  },

  async findManyByBoardId(boardId: string): Promise<PrismaList[]> {
    return prisma.list.findMany({ where: { boardId }, orderBy: { position: "asc" } });
  },

  async delete(id: string): Promise<void> {
    await prisma.list.delete({ where: { id } });
  },
};