import type { Request, Response, NextFunction } from "express";
import type { WorkspaceRole } from "@prisma/client";
import { workspaceRepository } from "../repositories/workspace.repository";
import { WorkspaceNotFoundError, InsufficientPermissionError } from "../utils/errors";

const ROLE_HIERARCHY: Record<WorkspaceRole, number> = {
  MEMBER: 0,
  ADMIN: 1,
  OWNER: 2,
};

export function requireWorkspaceRole(minimumRole: WorkspaceRole) {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const workspaceId = req.params.id;

      if (typeof workspaceId !== "string") {
        throw new WorkspaceNotFoundError();
      }

      const membership = await workspaceRepository.findMembership(
        req.userId!,
        workspaceId
      );

      if (!membership) {
        throw new WorkspaceNotFoundError();
      }

      const hasEnoughPermission =
        ROLE_HIERARCHY[membership.role] >= ROLE_HIERARCHY[minimumRole];

      if (!hasEnoughPermission) {
        throw new InsufficientPermissionError();
      }

      req.workspaceRole = membership.role;
      next();
    } catch (error) {
      next(error);
    }
  };
}