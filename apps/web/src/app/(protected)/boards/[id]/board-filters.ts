import type { Card } from "@kanbix/shared-types";

/** Sentinela pro filtro de responsável: "sem responsável", não um id real. */
export const UNASSIGNED_FILTER = "UNASSIGNED";

export interface BoardFilters {
  priorities: Set<Card["priority"]>;
  labelIds: Set<string>;
  /** null = todos. UNASSIGNED_FILTER = sem responsável. Senão, um userId. */
  assigneeId: string | null;
  overdueOnly: boolean;
}

export const EMPTY_FILTERS: BoardFilters = {
  priorities: new Set(),
  labelIds: new Set(),
  assigneeId: null,
  overdueOnly: false,
};

export function hasActiveFilters(filters: BoardFilters): boolean {
  return (
    filters.priorities.size > 0 ||
    filters.labelIds.size > 0 ||
    filters.assigneeId !== null ||
    filters.overdueOnly
  );
}

/**
 * "Atrasado" usa a mesma regra do dashboard (dashboard.repository.ts,
 * countOverdue): dueDate no passado e ainda não concluído.
 */
function isOverdue(card: Card, now: Date): boolean {
  return (
    card.dueDate !== null &&
    card.completedAt === null &&
    new Date(card.dueDate) < now
  );
}

export function matchesFilters(
  card: Card,
  filters: BoardFilters,
  now = new Date()
): boolean {
  if (filters.priorities.size > 0 && !filters.priorities.has(card.priority)) {
    return false;
  }

  if (filters.labelIds.size > 0) {
    const cardLabelIds = new Set(card.labels.map((label) => label.id));
    const hasMatchingLabel = [...filters.labelIds].some((id) =>
      cardLabelIds.has(id)
    );
    if (!hasMatchingLabel) return false;
  }

  if (filters.assigneeId !== null) {
    const wantsUnassigned = filters.assigneeId === UNASSIGNED_FILTER;
    if (wantsUnassigned ? card.assigneeId !== null : card.assigneeId !== filters.assigneeId) {
      return false;
    }
  }

  if (filters.overdueOnly && !isOverdue(card, now)) {
    return false;
  }

  return true;
}
