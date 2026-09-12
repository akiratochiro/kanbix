import { dashboardRepository } from "../repositories/dashboard.repository";
import { assertBoardMembership } from "../utils/board-access";

const PRODUCTIVITY_WINDOW_DAYS = 14;

export interface BoardDashboard {
  totalCards: number;
  completedCards: number;
  overdueCards: number;
  completionRate: number;
  cardsByAssignee: { assigneeId: string | null; count: number }[];
  completedByDay: { date: string; count: number }[];
}

function startOfDay(date: Date): Date {
  const copy = new Date(date);
  copy.setHours(0, 0, 0, 0);
  return copy;
}

/**
 * Um balde por dia dos últimos PRODUCTIVITY_WINDOW_DAYS dias (incluindo
 * hoje), todos zerados, para o gráfico de produtividade não ter buracos
 * nos dias sem nenhuma conclusão.
 */
function buildCompletedByDay(
  completedCards: { completedAt: Date }[],
  since: Date
): { date: string; count: number }[] {
  const counts = new Map<string, number>();

  for (let i = 0; i < PRODUCTIVITY_WINDOW_DAYS; i++) {
    const day = new Date(since);
    day.setDate(day.getDate() + i);
    counts.set(day.toISOString().slice(0, 10), 0);
  }

  for (const card of completedCards) {
    const key = card.completedAt.toISOString().slice(0, 10);
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }

  return Array.from(counts.entries()).map(([date, count]) => ({ date, count }));
}

export const dashboardService = {
  async getBoardDashboard(boardId: string, userId: string): Promise<BoardDashboard> {
    await assertBoardMembership(boardId, userId);

    const since = startOfDay(new Date());
    since.setDate(since.getDate() - (PRODUCTIVITY_WINDOW_DAYS - 1));

    const [totalCards, completedCards, overdueCards, cardsByAssignee, completedSince] =
      await Promise.all([
        dashboardRepository.countTotal(boardId),
        dashboardRepository.countCompleted(boardId),
        dashboardRepository.countOverdue(boardId),
        dashboardRepository.countByAssignee(boardId),
        dashboardRepository.findCompletedSince(boardId, since),
      ]);

    const completionRate =
      totalCards === 0 ? 0 : Math.round((completedCards / totalCards) * 100);

    return {
      totalCards,
      completedCards,
      overdueCards,
      completionRate,
      cardsByAssignee,
      completedByDay: buildCompletedByDay(completedSince, since),
    };
  },
};
