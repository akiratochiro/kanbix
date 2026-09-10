import { prisma } from "../config/prisma";
import type { Card as PrismaCard } from "@prisma/client";

export interface CreateCardData {
  title: string;
  description?: string;
  priority?: "LOW" | "MEDIUM" | "HIGH" | "URGENT";
  dueDate?: Date;
  assigneeId?: string;
  listId: string;
}

export interface UpdateCardData {
  title?: string;
  description?: string;
  priority?: "LOW" | "MEDIUM" | "HIGH" | "URGENT";
  dueDate?: Date | null;
  assigneeId?: string | null;
  listId?: string;
  position?: number;
}

export const cardRepository = {
  async create(data: CreateCardData): Promise<PrismaCard> {
    const count = await prisma.card.count({ where: { listId: data.listId } });
    return prisma.card.create({ data: { ...data, position: count } });
  },

  async findById(id: string): Promise<PrismaCard | null> {
    return prisma.card.findUnique({ where: { id } });
  },

  async findManyByListId(listId: string): Promise<PrismaCard[]> {
    return prisma.card.findMany({ where: { listId }, orderBy: { position: "asc" } });
  },

  async countByListId(listId: string): Promise<number> {
    return prisma.card.count({ where: { listId } });
  },

  async move(params: {
    cardId: string;
    sourceListId: string;
    targetListId: string;
    oldPosition: number;
    newPosition: number;
  }): Promise<PrismaCard> {
    const { cardId, sourceListId, targetListId, oldPosition, newPosition } =
      params;

    return prisma.$transaction(async (tx) => {
      if (sourceListId === targetListId) {
        if (newPosition < oldPosition) {
          await tx.card.updateMany({
            where: {
              listId: sourceListId,
              position: { gte: newPosition, lt: oldPosition },
            },
            data: { position: { increment: 1 } },
          });
        } else if (newPosition > oldPosition) {
          await tx.card.updateMany({
            where: {
              listId: sourceListId,
              position: { gt: oldPosition, lte: newPosition },
            },
            data: { position: { decrement: 1 } },
          });
        }
      } else {
        // fecha o buraco na lista de origem
        await tx.card.updateMany({
          where: { listId: sourceListId, position: { gt: oldPosition } },
          data: { position: { decrement: 1 } },
        });
        // abre espaço na lista de destino
        await tx.card.updateMany({
          where: { listId: targetListId, position: { gte: newPosition } },
          data: { position: { increment: 1 } },
        });
      }

      return tx.card.update({
        where: { id: cardId },
        data: { listId: targetListId, position: newPosition },
      });
    });
  },

  async update(id: string, data: UpdateCardData): Promise<PrismaCard> {
    return prisma.card.update({ where: { id }, data });
  },

  async delete(id: string): Promise<void> {
    await prisma.card.delete({ where: { id } });
  },
};