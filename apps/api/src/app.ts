import express from "express";
import cors from "cors";
import { userRoutes } from "./routes/user.routes";
import { workspaceRoutes } from "./routes/workspace.routes";
import { errorHandler } from "./middlewares/error-handler";
import { boardRoutes } from "./routes/board.routes";
import { cardRoutes } from "./routes/card.routes";
import { listRoutes } from "./routes/list.routes";
import { memberRoutes } from "./routes/member.routes";

export const app = express();

// Em produção, restrinja a origem via CORS_ORIGIN (lista separada por
// vírgula). Sem a env (dev), reflete qualquer origem.
const corsOrigin = process.env.CORS_ORIGIN
  ? process.env.CORS_ORIGIN.split(",").map((origin) => origin.trim())
  : true;

app.use(cors({ origin: corsOrigin }));
app.use(express.json());

app.get("/health", (_req, res) => {
  res.status(200).json({ status: "ok" });
});

app.use("/api", userRoutes);
app.use("/api", workspaceRoutes);
app.use("/api", boardRoutes);
app.use("/api", listRoutes);
app.use("/api", cardRoutes);
app.use("/api", memberRoutes);

app.use(errorHandler);