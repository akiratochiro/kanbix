import type { Request, Response, NextFunction } from "express";
import { listService } from "../services/list.service";
import type { CreateListInput } from "../schemas/list.schema";

export const listController = {
  async create(
    req: Request<{ id: string }, unknown, CreateListInput>,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const list = await listService.createList(req.params.id, req.userId!, req.body.name);
      res.status(201).json(list);
    } catch (error) {
      next(error);
    }
  },

  async list(req: Request<{ id: string }>, res: Response, next: NextFunction): Promise<void> {
    try {
      const lists = await listService.getListsByBoardId(req.params.id, req.userId!);
      res.status(200).json(lists);
    } catch (error) {
      next(error);
    }
  },

  async delete(req: Request<{ id: string }>, res: Response, next: NextFunction): Promise<void> {
    try {
      await listService.deleteList(req.params.id, req.userId!);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  },
};