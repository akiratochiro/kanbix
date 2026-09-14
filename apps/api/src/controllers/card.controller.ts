import type { Request, Response, NextFunction } from "express";
import { cardService } from "../services/card.service";
import type {
  AddCardLabelInput,
  CreateCardInput,
  MoveCardInput,
  UpdateCardInput,
} from "../schemas/card.schema";

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

  async getById(req: Request<{ id: string }>, res: Response, next: NextFunction): Promise<void> {
    try {
      const card = await cardService.getCardById(req.params.id, req.userId!);
      res.status(200).json(card);
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

  async move(
    req: Request<{ id: string }, unknown, MoveCardInput>,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const card = await cardService.moveCard(req.params.id, req.userId!, req.body);
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

  async addLabel(
    req: Request<{ id: string }, unknown, AddCardLabelInput>,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const card = await cardService.addLabelToCard(
        req.params.id,
        req.body.labelId,
        req.userId!
      );
      res.status(200).json(card);
    } catch (error) {
      next(error);
    }
  },

  async removeLabel(
    req: Request<{ id: string; labelId: string }>,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const card = await cardService.removeLabelFromCard(
        req.params.id,
        req.params.labelId,
        req.userId!
      );
      res.status(200).json(card);
    } catch (error) {
      next(error);
    }
  },
};