import type { WorkspaceMember } from "@kanbix/shared-types";
import { apiClient } from "@/lib/api-client";

export interface AddMemberPayload {
  email: string;
  role: "ADMIN" | "MEMBER";
}

/**
 * Acesso à API de membros de workspace. Sem React, sem cache.
 */
export const memberService = {
  listByWorkspace: (workspaceId: string) =>
    apiClient.get<WorkspaceMember[]>(`/workspaces/${workspaceId}/members`),

  add: (workspaceId: string, payload: AddMemberPayload) =>
    apiClient.post<WorkspaceMember>(`/workspaces/${workspaceId}/members`, payload),

  updateRole: (workspaceId: string, userId: string, role: WorkspaceMember["role"]) =>
    apiClient.patch<WorkspaceMember>(
      `/workspaces/${workspaceId}/members/${userId}`,
      { role }
    ),

  remove: (workspaceId: string, userId: string) =>
    apiClient.delete<void>(`/workspaces/${workspaceId}/members/${userId}`),
};
