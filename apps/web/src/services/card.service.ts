import type { Card } from "@kanbix/shared-types";
import { apiClient } from "@/lib/api-client";

/**
 * Acesso à API de cartões. Sem React, sem cache.
 */
export const cardService = {
  listByList: (listId: string) =>
    apiClient.get<Card[]>(`/lists/${listId}/cards`),
};
