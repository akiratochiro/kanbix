import type { Request, Response, NextFunction } from "express";
import { dashboardService } from "../services/dashboard.service";

export const dashboardController = {
  async getBoardDashboard(
    req: Request<{ id: string }>,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const dashboard = await dashboardService.getBoardDashboard(
        req.params.id,
        req.userId!
      );
      res.status(200).json(dashboard);
    } catch (error) {
      next(error);
    }
  },
};
