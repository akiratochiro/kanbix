import { prisma } from "../config/prisma";
import type { ChecklistItem as PrismaChecklistItem } from "@prisma/client";

export interface CreateChecklistItemData {
  text: string;
  cardId: string;
}

export interface UpdateChecklistItemData {
  text?: string;
  completed?: boolean;
}

export const checklistItemRepository = {
  async create(data: CreateChecklistItemData): Promise<PrismaChecklistItem> {
    const count = await prisma.checklistItem.count({ where: { cardId: data.cardId } });
    return prisma.checklistItem.create({ data: { ...data, position: count } });
  },

  async findById(id: string): Promise<PrismaChecklistItem | null> {
    return prisma.checklistItem.findUnique({ where: { id } });
  },

  async findManyByCardId(cardId: string): Promise<PrismaChecklistItem[]> {
    return prisma.checklistItem.findMany({
      where: { cardId },
      orderBy: { position: "asc" },
    });
  },

  async update(id: string, data: UpdateChecklistItemData): Promise<PrismaChecklistItem> {
    return prisma.checklistItem.update({ where: { id }, data });
  },

  async delete(id: string): Promise<void> {
    await prisma.checklistItem.delete({ where: { id } });
  },
};
