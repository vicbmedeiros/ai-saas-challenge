import express from "express";
import cors from "cors";
import { authRouter } from "./routes/auth.routes";
import { authMiddleware } from "./middleware/auth";
import { productRouter } from "./routes/product.routes";
import { chatRouter } from "./routes/chat.routes";

export const app = express();

app.use(cors());
app.use(express.json());
app.use("/auth", authRouter);
app.use("/products", productRouter);
app.use("/chat", chatRouter);
app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});
app.get("/me", authMiddleware, (req, res) => {
    res.json(req.user);
  });



