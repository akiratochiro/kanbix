import type { Request, Response, NextFunction } from "express";
import { userService } from "../services/user.service";
import type { CreateUserInput } from "../schemas/user.schema";
import type { LoginInput } from "../schemas/login.schema";

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

  async login(
    req: Request<unknown, unknown, LoginInput>,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const result = await userService.login(req.body);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  },

  async me(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const user = await userService.getUserById(req.userId!);
    res.status(200).json(user);
  } catch (error) {
    next(error);
  }
},
};