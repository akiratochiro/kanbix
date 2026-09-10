import type { List } from "@kanbix/shared-types";
import { apiClient } from "@/lib/api-client";

/**
 * Acesso à API de listas (colunas). Sem React, sem cache.
 */
export const listService = {
  listByBoard: (boardId: string) =>
    apiClient.get<List[]>(`/boards/${boardId}/lists`),

  create: (boardId: string, name: string) =>
    apiClient.post<List>(`/boards/${boardId}/lists`, { name }),
};
