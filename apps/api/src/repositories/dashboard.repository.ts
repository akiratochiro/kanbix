import { prisma } from "../config/prisma";

export const dashboardRepository = {
  async countTotal(boardId: string): Promise<number> {
    return prisma.card.count({ where: { list: { boardId } } });
  },

  async countCompleted(boardId: string): Promise<number> {
    return prisma.card.count({
      where: { list: { boardId }, completedAt: { not: null } },
    });
  },

  async countOverdue(boardId: string): Promise<number> {
    return prisma.card.count({
      where: {
        list: { boardId },
        completedAt: null,
        dueDate: { lt: new Date() },
      },
    });
  },

  async countByAssignee(
    boardId: string
  ): Promise<{ assigneeId: string | null; count: number }[]> {
    const groups = await prisma.card.groupBy({
      by: ["assigneeId"],
      where: { list: { boardId } },
      _count: { _all: true },
    });

    return groups.map((group) => ({
      assigneeId: group.assigneeId,
      count: group._count._all,
    }));
  },

  async findCompletedSince(
    boardId: string,
    since: Date
  ): Promise<{ completedAt: Date }[]> {
    const cards = await prisma.card.findMany({
      where: { list: { boardId }, completedAt: { gte: since } },
      select: { completedAt: true },
    });

    return cards.filter(
      (card): card is { completedAt: Date } => card.completedAt !== null
    );
  },
};
