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

  async update(id: string, data: UpdateCardData): Promise<PrismaCard> {
    return prisma.card.update({ where: { id }, data });
  },

  async delete(id: string): Promise<void> {
    await prisma.card.delete({ where: { id } });
  },
};