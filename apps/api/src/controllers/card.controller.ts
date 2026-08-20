import type { Request, Response, NextFunction } from "express";
import { cardService } from "../services/card.service";
import type { CreateCardInput, UpdateCardInput } from "../schemas/card.schema";

export const cardController = {
  async create(
    req: Request<{ id: string }, unknown, CreateCardInput>,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const card = await cardService.createCard(req.params.id, req.userId!, req.body);
      res.status(201).json(card);
    } catch (error) {
      next(error);
    }
  },

  async list(req: Request<{ id: string }>, res: Response, next: NextFunction): Promise<void> {
    try {
      const cards = await cardService.getCardsByListId(req.params.id, req.userId!);
      res.status(200).json(cards);
    } catch (error) {
      next(error);
    }
  },

  async update(
    req: Request<{ id: string }, unknown, UpdateCardInput>,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const card = await cardService.updateCard(req.params.id, req.userId!, req.body);
      res.status(200).json(card);
    } catch (error) {
      next(error);
    }
  },

  async delete(req: Request<{ id: string }>, res: Response, next: NextFunction): Promise<void> {
    try {
      await cardService.deleteCard(req.params.id, req.userId!);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  },
};