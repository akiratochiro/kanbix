import type { Label } from "@kanbix/shared-types";
import { apiClient } from "@/lib/api-client";

/**
 * Acesso à API de etiquetas (labels). Sem React, sem cache.
 */
export const labelService = {
  listByBoard: (boardId: string) =>
    apiClient.get<Label[]>(`/boards/${boardId}/labels`),

  create: (boardId: string, payload: { name: string; color: string }) =>
    apiClient.post<Label>(`/boards/${boardId}/labels`, payload),
};
