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

export const cardService = {
  listByList: (listId: string) =>
    apiClient.get<Card[]>(`/lists/${listId}/cards`),

  create: (listId: string, payload: CreateCardPayload) =>
    apiClient.post<Card>(`/lists/${listId}/cards`, payload),
};
