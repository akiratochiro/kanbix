import { Router } from "express";
import { cardController } from "../controllers/card.controller";
import { validate } from "../middlewares/validate";
import {
  createCardSchema,
  moveCardSchema,
  updateCardSchema,
} from "../schemas/card.schema";
import { authenticate } from "../middlewares/authenticate";

export const cardRoutes = Router();

cardRoutes.post("/lists/:id/cards", authenticate, validate(createCardSchema), cardController.create);
cardRoutes.get("/lists/:id/cards", authenticate, cardController.list);
cardRoutes.get("/cards/:id", authenticate, cardController.getById);
cardRoutes.patch("/cards/:id/move", authenticate, validate(moveCardSchema), cardController.move);
cardRoutes.patch("/cards/:id", authenticate, validate(updateCardSchema), cardController.update);
cardRoutes.delete("/cards/:id", authenticate, cardController.delete);