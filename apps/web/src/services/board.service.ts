import type { Board, BoardDashboard } from "@kanbix/shared-types";
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

  getById: (boardId: string) => apiClient.get<Board>(`/boards/${boardId}`),

  create: (workspaceId: string, payload: CreateBoardPayload) =>
    apiClient.post<Board>(`/workspaces/${workspaceId}/boards`, payload),

  update: (boardId: string, payload: CreateBoardPayload) =>
    apiClient.patch<Board>(`/boards/${boardId}`, payload),

  remove: (boardId: string) => apiClient.delete<void>(`/boards/${boardId}`),

  getDashboard: (boardId: string) =>
    apiClient.get<BoardDashboard>(`/boards/${boardId}/dashboard`),
};
