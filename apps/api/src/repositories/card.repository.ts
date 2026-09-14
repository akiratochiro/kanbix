import { prisma } from "../config/prisma";

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
  completedAt?: Date | null;
  assigneeId?: string | null;
  listId?: string;
  position?: number;
}

export const cardRepository = {
  // Sem anotação de retorno explícita nos métodos que fazem `include`: o
  // Prisma infere o tipo certo (Card + labels) a partir da própria query.
  async create(data: CreateCardData) {
    const count = await prisma.card.count({ where: { listId: data.listId } });
    return prisma.card.create({
      data: { ...data, position: count },
      include: { labels: true },
    });
  },

  async findById(id: string) {
    return prisma.card.findUnique({ where: { id }, include: { labels: true } });
  },

  async findManyByListId(listId: string) {
    return prisma.card.findMany({
      where: { listId },
      orderBy: { position: "asc" },
      include: { labels: true },
    });
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
  }) {
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
        include: { labels: true },
      });
    });
  },

  async update(id: string, data: UpdateCardData) {
    return prisma.card.update({ where: { id }, data, include: { labels: true } });
  },

  async delete(id: string): Promise<void> {
    await prisma.card.delete({ where: { id } });
  },

  async addLabel(cardId: string, labelId: string) {
    return prisma.card.update({
      where: { id: cardId },
      data: { labels: { connect: { id: labelId } } },
      include: { labels: true },
    });
  },

  async removeLabel(cardId: string, labelId: string) {
    return prisma.card.update({
      where: { id: cardId },
      data: { labels: { disconnect: { id: labelId } } },
      include: { labels: true },
    });
  },
};