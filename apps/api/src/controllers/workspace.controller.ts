import type { Request, Response, NextFunction } from "express";
import { workspaceService } from "../services/workspace.service";
import type { CreateWorkspaceInput, UpdateWorkspaceInput } from "../schemas/workspace.schema";

export const workspaceController = {
  async create(
    req: Request<unknown, unknown, CreateWorkspaceInput>,
    res: Response,
    next: NextFunction,
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

  async list(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const workspaces = await workspaceService.getWorkspacesByUserId(
        req.userId!,
      );
      res.status(200).json(workspaces);
    } catch (error) {
      next(error);
    }
  },

  async update(
    req: Request<{ id: string }, unknown, UpdateWorkspaceInput>,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const workspace = await workspaceService.updateWorkspace(
        req.params.id,
        req.body,
      );
      res.status(200).json(workspace);
    } catch (error) {
      next(error);
    }
  },
};
