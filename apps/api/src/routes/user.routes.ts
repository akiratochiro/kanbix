import { Router } from "express";
import { userController } from "../controllers/user.controller";
import { validate } from "../middlewares/validate";
import { createUserSchema } from "../schemas/user.schema";
import { loginSchema } from "../schemas/login.schema";
import { authenticate } from "../middlewares/authenticate";

export const userRoutes = Router();

userRoutes.post("/users", validate(createUserSchema), userController.create);
userRoutes.post("/login", validate(loginSchema), userController.login);
userRoutes.get("/me", authenticate, userController.me);