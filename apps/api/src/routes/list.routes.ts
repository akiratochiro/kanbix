import { Router } from "express";
import { listController } from "../controllers/list.controller";
import { validate } from "../middlewares/validate";
import { createListSchema } from "../schemas/list.schema";
import { authenticate } from "../middlewares/authenticate";

export const listRoutes = Router();

listRoutes.post("/boards/:id/lists", authenticate, validate(createListSchema), listController.create);
listRoutes.get("/boards/:id/lists", authenticate, listController.list);
listRoutes.delete("/lists/:id", authenticate, listController.delete);