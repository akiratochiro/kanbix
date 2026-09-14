import { Router } from "express";
import { boardController } from "../controllers/board.controller";
import { validate } from "../middlewares/validate";
import { createBoardSchema, updateBoardSchema } from "../schemas/board.schema";
import { authenticate } from "../middlewares/authenticate";
import { requireWorkspaceRole } from "../middlewares/require-workspace-role";

export const boardRoutes = Router();

boardRoutes.post(
  "/workspaces/:id/boards",
  authenticate,
  requireWorkspaceRole("MEMBER"),
  validate(createBoardSchema),
  boardController.create,
);

boardRoutes.get(
  "/workspaces/:id/boards",
  authenticate,
  requireWorkspaceRole("MEMBER"),
  boardController.list,
);

boardRoutes.get("/boards/:id", authenticate, boardController.getById);

boardRoutes.patch(
  "/boards/:id",
  authenticate,
  validate(updateBoardSchema),
  boardController.update,
);

boardRoutes.delete("/boards/:id", authenticate, boardController.delete);
