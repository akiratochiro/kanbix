import express from "express";
import cors from "cors";
import { userRoutes } from "./routes/user.routes";
import { workspaceRoutes } from "./routes/workspace.routes";
import { errorHandler } from "./middlewares/error-handler";
import { boardRoutes } from "./routes/board.routes";

export const app = express();

app.use(cors());
app.use(express.json());

app.get("/health", (_req, res) => {
  res.status(200).json({ status: "ok" });
});

app.use("/api", userRoutes);
app.use("/api", workspaceRoutes);
app.use("/api", boardRoutes);

app.use(errorHandler);