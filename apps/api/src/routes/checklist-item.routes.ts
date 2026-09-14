import { Router } from "express";
import { checklistItemController } from "../controllers/checklist-item.controller";
import { validate } from "../middlewares/validate";
import {
  createChecklistItemSchema,
  updateChecklistItemSchema,
} from "../schemas/checklist-item.schema";
import { authenticate } from "../middlewares/authenticate";

export const checklistItemRoutes = Router();

checklistItemRoutes.post(
  "/cards/:id/checklist-items",
  authenticate,
  validate(createChecklistItemSchema),
  checklistItemController.create
);
checklistItemRoutes.get(
  "/cards/:id/checklist-items",
  authenticate,
  checklistItemController.list
);
checklistItemRoutes.patch(
  "/checklist-items/:id",
  authenticate,
  validate(updateChecklistItemSchema),
  checklistItemController.update
);
checklistItemRoutes.delete(
  "/checklist-items/:id",
  authenticate,
  checklistItemController.delete
);
