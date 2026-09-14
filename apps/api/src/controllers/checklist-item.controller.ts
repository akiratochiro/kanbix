import type { Request, Response, NextFunction } from "express";
import { checklistItemService } from "../services/checklist-item.service";
import type {
  CreateChecklistItemInput,
  UpdateChecklistItemInput,
} from "../schemas/checklist-item.schema";

export const checklistItemController = {
  async create(
    req: Request<{ id: string }, unknown, CreateChecklistItemInput>,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const item = await checklistItemService.createItem(
        req.params.id,
        req.userId!,
        req.body.text
      );
      res.status(201).json(item);
    } catch (error) {
      next(error);
    }
  },

  async list(req: Request<{ id: string }>, res: Response, next: NextFunction): Promise<void> {
    try {
      const items = await checklistItemService.getItemsByCardId(req.params.id, req.userId!);
      res.status(200).json(items);
    } catch (error) {
      next(error);
    }
  },

  async update(
    req: Request<{ id: string }, unknown, UpdateChecklistItemInput>,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const item = await checklistItemService.updateItem(
        req.params.id,
        req.userId!,
        req.body
      );
      res.status(200).json(item);
    } catch (error) {
      next(error);
    }
  },

  async delete(req: Request<{ id: string }>, res: Response, next: NextFunction): Promise<void> {
    try {
      await checklistItemService.deleteItem(req.params.id, req.userId!);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  },
};
