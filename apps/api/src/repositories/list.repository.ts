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

  async countByBoardId(boardId: string): Promise<number> {
    return prisma.list.count({ where: { boardId } });
  },

  async reorder(params: {
    listId: string;
    boardId: string;
    oldPosition: number;
    newPosition: number;
  }): Promise<PrismaList> {
    const { listId, boardId, oldPosition, newPosition } = params;

    return prisma.$transaction(async (tx) => {
      if (newPosition < oldPosition) {
        await tx.list.updateMany({
          where: { boardId, position: { gte: newPosition, lt: oldPosition } },
          data: { position: { increment: 1 } },
        });
      } else if (newPosition > oldPosition) {
        await tx.list.updateMany({
          where: { boardId, position: { gt: oldPosition, lte: newPosition } },
          data: { position: { decrement: 1 } },
        });
      }

      return tx.list.update({
        where: { id: listId },
        data: { position: newPosition },
      });
    });
  },

  async update(id: string, name: string): Promise<PrismaList> {
    return prisma.list.update({ where: { id }, data: { name } });
  },

  async delete(id: string): Promise<void> {
    await prisma.list.delete({ where: { id } });
  },
};