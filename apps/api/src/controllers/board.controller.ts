import type { Request, Response, NextFunction } from "express";
import { boardService } from "../services/board.service";
import type { CreateBoardInput } from "../schemas/board.schema";

export const boardController = {
  async create(
    req: Request<{ id: string }, unknown, CreateBoardInput>,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const board = await boardService.createBoard({
        ...req.body,
        workspaceId: req.params.id,
        createdById: req.userId!,
      });
      res.status(201).json(board);
    } catch (error) {
      next(error);
    }
  },

  async list(
    req: Request<{ id: string }>,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const boards = await boardService.getBoardsByWorkspaceId(req.params.id);
      res.status(200).json(boards);
    } catch (error) {
      next(error);
    }
  },
};