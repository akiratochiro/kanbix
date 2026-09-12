import { Router } from "express";
import { dashboardController } from "../controllers/dashboard.controller";
import { authenticate } from "../middlewares/authenticate";

export const dashboardRoutes = Router();

dashboardRoutes.get(
  "/boards/:id/dashboard",
  authenticate,
  dashboardController.getBoardDashboard
);
