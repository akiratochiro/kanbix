import type { ChecklistItem } from "@kanbix/shared-types";
import { apiClient } from "@/lib/api-client";

/**
 * Acesso à API de itens de checklist. Sem React, sem cache.
 */
export const checklistItemService = {
  listByCard: (cardId: string) =>
    apiClient.get<ChecklistItem[]>(`/cards/${cardId}/checklist-items`),

  create: (cardId: string, text: string) =>
    apiClient.post<ChecklistItem>(`/cards/${cardId}/checklist-items`, { text }),

  update: (itemId: string, payload: { text?: string; completed?: boolean }) =>
    apiClient.patch<ChecklistItem>(`/checklist-items/${itemId}`, payload),

  remove: (itemId: string) =>
    apiClient.delete<void>(`/checklist-items/${itemId}`),
};
