import type { Request, Response, NextFunction } from "express";
import { labelService } from "../services/label.service";
import type { CreateLabelInput, UpdateLabelInput } from "../schemas/label.schema";

export const labelController = {
  async create(
    req: Request<{ id: string }, unknown, CreateLabelInput>,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const label = await labelService.createLabel(
        req.params.id,
        req.userId!,
        req.body
      );
      res.status(201).json(label);
    } catch (error) {
      next(error);
    }
  },

  async list(req: Request<{ id: string }>, res: Response, next: NextFunction): Promise<void> {
    try {
      const labels = await labelService.getLabelsByBoardId(req.params.id, req.userId!);
      res.status(200).json(labels);
    } catch (error) {
      next(error);
    }
  },

  async update(
    req: Request<{ id: string }, unknown, UpdateLabelInput>,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const label = await labelService.updateLabel(req.params.id, req.userId!, req.body);
      res.status(200).json(label);
    } catch (error) {
      next(error);
    }
  },

  async delete(req: Request<{ id: string }>, res: Response, next: NextFunction): Promise<void> {
    try {
      await labelService.deleteLabel(req.params.id, req.userId!);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  },
};
