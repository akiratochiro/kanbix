import type { Board } from "@kanbix/shared-types";
import { apiClient } from "@/lib/api-client";

/**
 * Acesso à API de boards. Sem React, sem cache.
 */
export const boardService = {
  listByWorkspace: (workspaceId: string) =>
    apiClient.get<Board[]>(`/workspaces/${workspaceId}/boards`),
};
