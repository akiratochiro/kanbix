import { Router } from "express";
import { workspaceController } from "../controllers/workspace.controller";
import { validate } from "../middlewares/validate";
import { createWorkspaceSchema, updateWorkspaceSchema } from "../schemas/workspace.schema";
import { authenticate } from "../middlewares/authenticate";
import { requireWorkspaceRole } from "../middlewares/require-workspace-role";

export const workspaceRoutes = Router();

workspaceRoutes.post(
  "/workspaces",
  authenticate,
  validate(createWorkspaceSchema),
  workspaceController.create
);

workspaceRoutes.get("/workspaces", authenticate, workspaceController.list);

workspaceRoutes.patch(
  "/workspaces/:id",
  authenticate,
  requireWorkspaceRole("ADMIN"),
  validate(updateWorkspaceSchema),
  workspaceController.update
);