import type { WorkspaceWithRole } from "@kanbix/shared-types";
import { apiClient } from "@/lib/api-client";

/**
 * Acesso à API de workspaces. Sem React, sem cache.
 */
export const workspaceService = {
  list: () => apiClient.get<WorkspaceWithRole[]>("/workspaces"),
};
