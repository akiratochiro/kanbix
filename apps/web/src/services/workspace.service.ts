import type { Workspace, WorkspaceWithRole } from "@kanbix/shared-types";
import { apiClient } from "@/lib/api-client";

export interface CreateWorkspacePayload {
  name: string;
  description?: string;
}

/**
 * Acesso à API de workspaces. Sem React, sem cache.
 */
export const workspaceService = {
  list: () => apiClient.get<WorkspaceWithRole[]>("/workspaces"),

  create: (payload: CreateWorkspacePayload) =>
    apiClient.post<Workspace>("/workspaces", payload),
};
