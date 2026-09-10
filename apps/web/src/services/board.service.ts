import type { Board } from "@kanbix/shared-types";
import { apiClient } from "@/lib/api-client";

export interface CreateBoardPayload {
  name: string;
  description?: string;
  color?: string;
}

/**
 * Acesso à API de boards. Sem React, sem cache.
 */
export const boardService = {
  listByWorkspace: (workspaceId: string) =>
    apiClient.get<Board[]>(`/workspaces/${workspaceId}/boards`),

  create: (workspaceId: string, payload: CreateBoardPayload) =>
    apiClient.post<Board>(`/workspaces/${workspaceId}/boards`, payload),
};
