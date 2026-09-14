import { Router } from "express";
import { labelController } from "../controllers/label.controller";
import { validate } from "../middlewares/validate";
import { createLabelSchema, updateLabelSchema } from "../schemas/label.schema";
import { authenticate } from "../middlewares/authenticate";

export const labelRoutes = Router();

labelRoutes.post(
  "/boards/:id/labels",
  authenticate,
  validate(createLabelSchema),
  labelController.create
);
labelRoutes.get("/boards/:id/labels", authenticate, labelController.list);
labelRoutes.patch(
  "/labels/:id",
  authenticate,
  validate(updateLabelSchema),
  labelController.update
);
labelRoutes.delete("/labels/:id", authenticate, labelController.delete);
