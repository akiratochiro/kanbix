import { Router } from "express";
import { memberController } from "../controllers/member.controller";
import { validate } from "../middlewares/validate";
import { addMemberSchema, updateMemberRoleSchema } from "../schemas/member.schema";
import { authenticate } from "../middlewares/authenticate";
import { requireWorkspaceRole } from "../middlewares/require-workspace-role";

export const memberRoutes = Router();

memberRoutes.get(
  "/workspaces/:id/members",
  authenticate,
  requireWorkspaceRole("MEMBER"),
  memberController.list
);

memberRoutes.post(
  "/workspaces/:id/members",
  authenticate,
  requireWorkspaceRole("ADMIN"),
  validate(addMemberSchema),
  memberController.create
);

memberRoutes.patch(
  "/workspaces/:id/members/:userId",
  authenticate,
  requireWorkspaceRole("OWNER"),
  validate(updateMemberRoleSchema),
  memberController.updateRole
);

memberRoutes.delete(
  "/workspaces/:id/members/:userId",
  authenticate,
  requireWorkspaceRole("ADMIN"),
  memberController.delete
);
