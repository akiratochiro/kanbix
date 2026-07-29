import type { Request, Response, NextFunction } from "express";
import { userService } from "../services/user.service";
import type { CreateUserInput } from "../schemas/user.schema";

export const userController = {
  async create(
    req: Request<unknown, unknown, CreateUserInput>,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const user = await userService.createUser(req.body);
      res.status(201).json(user);
    } catch (error) {
      next(error);
    }
  },
};  