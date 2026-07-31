import { Router } from "express";
import { workspaceController } from "../controllers/workspace.controller";
import { validate } from "../middlewares/validate";
import { createWorkspaceSchema } from "../schemas/workspace.schema";
import { authenticate } from "../middlewares/authenticate";

export const workspaceRoutes = Router();

workspaceRoutes.post(
  "/workspaces",
  authenticate,
  validate(createWorkspaceSchema),
  workspaceController.create
);