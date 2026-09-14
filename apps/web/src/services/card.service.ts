import type { Card } from "@kanbix/shared-types";
import { apiClient } from "@/lib/api-client";

/**
 * Acesso à API de cartões. Sem React, sem cache.
 */
export interface CreateCardPayload {
  title: string;
  description?: string;
  priority?: Card["priority"];
  dueDate?: string;
}

export interface UpdateCardPayload {
  title?: string;
  description?: string;
  priority?: Card["priority"];
  dueDate?: string | null;
  completedAt?: string | null;
  assigneeId?: string | null;
}

export const cardService = {
  listByList: (listId: string) =>
    apiClient.get<Card[]>(`/lists/${listId}/cards`),

  getById: (cardId: string) => apiClient.get<Card>(`/cards/${cardId}`),

  create: (listId: string, payload: CreateCardPayload) =>
    apiClient.post<Card>(`/lists/${listId}/cards`, payload),

  update: (cardId: string, payload: UpdateCardPayload) =>
    apiClient.patch<Card>(`/cards/${cardId}`, payload),

  remove: (cardId: string) => apiClient.delete<void>(`/cards/${cardId}`),

  move: (cardId: string, payload: { toListId: string; toIndex: number }) =>
    apiClient.patch<Card>(`/cards/${cardId}/move`, payload),

  addLabel: (cardId: string, labelId: string) =>
    apiClient.post<Card>(`/cards/${cardId}/labels`, { labelId }),

  removeLabel: (cardId: string, labelId: string) =>
    apiClient.delete<Card>(`/cards/${cardId}/labels/${labelId}`),
};
