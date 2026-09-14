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

  remove: (listId: string) => apiClient.delete<void>(`/lists/${listId}`),

  move: (listId: string, toIndex: number) =>
    apiClient.patch<List>(`/lists/${listId}/move`, { toIndex }),

  update: (listId: string, name: string) =>
    apiClient.patch<List>(`/lists/${listId}`, { name }),
};
