import type { WorkspaceRole } from "@prisma/client";

declare global {
  namespace Express {
    interface Request {
      userId?: string;
      workspaceRole?: WorkspaceRole;
    }
  }
}

export {};