import type { Request, Response, NextFunction } from "express";
import { workspaceService } from "../services/workspace.service";
import type { CreateWorkspaceInput } from "../schemas/workspace.schema";

export const workspaceController = {
  async create(
    req: Request<unknown, unknown, CreateWorkspaceInput>,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const workspace = await workspaceService.createWorkspace({
        ...req.body,
        ownerId: req.userId!,
      });
      res.status(201).json(workspace);
    } catch (error) {
      next(error);
    }
  },
};