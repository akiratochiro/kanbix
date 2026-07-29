import express from "express";
import cors from "cors";
import { userRoutes } from "./routes/user.routes";
import { errorHandler } from "./middlewares/error-handler";

const app = express();

app.use(cors());
app.use(express.json());

app.get("/health", (_req, res) => {
  res.status(200).json({ status: "ok" });
});

app.use("/api", userRoutes);

app.use(errorHandler);

const PORT = process.env.PORT ?? 3333;

app.listen(PORT, () => {
  console.log(`🚀 Kanbix API rodando na porta ${PORT}`);
});