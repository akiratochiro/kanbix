import { Router } from "express";
import { boardController } from "../controllers/board.controller";
import { validate } from "../middlewares/validate";
import { createBoardSchema } from "../schemas/board.schema";
import { authenticate } from "../middlewares/authenticate";
import { requireWorkspaceRole } from "../middlewares/require-workspace-role";

export const boardRoutes = Router();

boardRoutes.post(
  "/workspaces/:id/boards",
  authenticate,
  requireWorkspaceRole("MEMBER"),
  validate(createBoardSchema),
  boardController.create
);

boardRoutes.get(
  "/workspaces/:id/boards",
  authenticate,
  requireWorkspaceRole("MEMBER"),
  boardController.list
);  