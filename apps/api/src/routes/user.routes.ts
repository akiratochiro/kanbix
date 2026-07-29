import { Router } from "express";
import { userController } from "../controllers/user.controller";
import { validate } from "../middlewares/validate";
import { createUserSchema } from "../schemas/user.schema";

export const userRoutes = Router();

userRoutes.post("/users", validate(createUserSchema), userController.create);