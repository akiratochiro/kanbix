import type { WorkspaceWithRole } from "@kanbix/shared-types";

export const WORKSPACE_ROLE_LABELS: Record<WorkspaceWithRole["role"], string> = {
  OWNER: "Dono",
  ADMIN: "Admin",
  MEMBER: "Membro",
};
